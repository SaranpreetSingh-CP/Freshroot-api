import {
	Controller,
	Get,
	Post,
	Patch,
	Param,
	Body,
	UseGuards,
	UploadedFile,
	UseInterceptors,
	BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { SupportService } from "./support.service.js";
import {
	CreateTicketDto,
	CreateMessageDto,
	UpdateTicketStatusDto,
	normalizeIssueType,
} from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

const storage = diskStorage({
	destination: "./uploads/support",
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
	const allowed = /\.(jpg|jpeg|png|gif|pdf)$/i;
	if (!allowed.test(extname(file.originalname))) {
		return cb(
			new BadRequestException("Only images and PDFs are allowed"),
			false,
		);
	}
	cb(null, true);
};

@Controller("support/tickets")
export class SupportController {
	constructor(private readonly supportService: SupportService) {}

	/** Create a new support ticket (with optional image upload) */
	@Post()
	@UseInterceptors(
		FileInterceptor("image", {
			storage,
			fileFilter,
			limits: { fileSize: 10 * 1024 * 1024 },
		}),
	)
	async create(@Body() body: any, @UploadedFile() file?: Express.Multer.File) {
		// Determine if deliveryId is a real UUID or a display label
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		const rawDeliveryId = body.deliveryId || "";
		const isUuid = uuidRegex.test(rawDeliveryId);

		const dto: CreateTicketDto = {
			customerId: body.customerId
				? typeof body.customerId === "string"
					? parseInt(body.customerId, 10)
					: body.customerId
				: undefined,
			deliveryId: isUuid ? rawDeliveryId : undefined,
			deliveryInfo: !isUuid && rawDeliveryId ? rawDeliveryId : undefined,
			issueType: normalizeIssueType(body.issueType),
			description: body.description,
		};
		const imageUrl = file ? `/uploads/support/${file.filename}` : undefined;
		return this.supportService.createTicket(dto, imageUrl);
	}

	/** List all tickets */
	@Get()
	async findAll() {
		return this.supportService.findAll();
	}

	/** Get tickets for a specific customer */
	@Get("customer/:customerId")
	async findByCustomer(@Param("customerId") customerId: string) {
		return this.supportService.findByCustomer(parseInt(customerId, 10));
	}

	/** Get single ticket with messages */
	@Get(":id")
	async findOne(@Param("id") id: string) {
		return this.supportService.findOne(id);
	}

	/** Add a message to a ticket (chat) */
	@Post(":id/messages")
	async addMessage(@Param("id") id: string, @Body() dto: CreateMessageDto) {
		return this.supportService.addMessage(id, dto);
	}

	/** Update ticket status */
	@Patch(":id/status")
	async updateStatus(
		@Param("id") id: string,
		@Body() dto: UpdateTicketStatusDto,
	) {
		return this.supportService.updateStatus(id, dto);
	}
}
