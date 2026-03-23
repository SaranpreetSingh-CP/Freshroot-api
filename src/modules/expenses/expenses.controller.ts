import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	UploadedFile,
	UseInterceptors,
	BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { ExpensesService } from "./expenses.service.js";
import { UpdateExpenseDto } from "./dto/index.js";

const storage = diskStorage({
	destination: "./uploads/expenses",
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${unique}${extname(file.originalname)}`);
	},
});

const fileFilter = (
	_req: any,
	file: Express.Multer.File,
	cb: (error: Error | null, accept: boolean) => void,
) => {
	const allowed = /\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i;
	if (!allowed.test(extname(file.originalname))) {
		return cb(
			new BadRequestException("Only images, PDFs, and docs are allowed"),
			false,
		);
	}
	cb(null, true);
};

@Controller("expenses")
export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	@Post()
	@UseInterceptors(
		FileInterceptor("file", {
			storage,
			fileFilter,
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	create(
		@Body() body: Record<string, string>,
		@UploadedFile() file?: Express.Multer.File,
	) {
		const dto = {
			category: body.category,
			description: body.description,
			amount: parseFloat(body.amount),
			date: body.date,
			paidTo: body.paidTo,
			billUrl: file ? `/uploads/expenses/${file.filename}` : undefined,
		};
		return this.expensesService.create(dto);
	}

	@Get()
	findAll() {
		return this.expensesService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.expensesService.findOne(id);
	}

	@Patch(":id")
	@UseInterceptors(
		FileInterceptor("file", {
			storage,
			fileFilter,
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	update(
		@Param("id") id: string,
		@Body() body: Record<string, string>,
		@UploadedFile() file?: Express.Multer.File,
	) {
		const dto: UpdateExpenseDto = {};
		if (body.category !== undefined) dto.category = body.category;
		if (body.description !== undefined) dto.description = body.description;
		if (body.amount !== undefined) dto.amount = parseFloat(body.amount);
		if (body.date !== undefined) dto.date = body.date;
		if (body.paidTo !== undefined) dto.paidTo = body.paidTo;
		if (file) dto.billUrl = `/uploads/expenses/${file.filename}`;
		return this.expensesService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.expensesService.remove(id);
	}
}
