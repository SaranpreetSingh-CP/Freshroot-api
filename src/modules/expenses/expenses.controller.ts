import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	UseGuards,
} from "@nestjs/common";
import { ExpensesService } from "./expenses.service.js";
import { CreateExpenseDto, UpdateExpenseDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("expenses")
@UseGuards(JwtAuthGuard)
export class ExpensesController {
	constructor(private readonly expensesService: ExpensesService) {}

	@Post()
	create(@Body() dto: CreateExpenseDto) {
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

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdateExpenseDto) {
		return this.expensesService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.expensesService.remove(id);
	}
}
