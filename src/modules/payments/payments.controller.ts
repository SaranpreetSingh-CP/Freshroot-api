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
import { PaymentsService } from "./payments.service.js";
import { CreatePaymentDto, UpdatePaymentDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post()
	create(@Body() dto: CreatePaymentDto) {
		return this.paymentsService.create(dto);
	}

	@Get()
	findAll() {
		return this.paymentsService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.paymentsService.findOne(id);
	}

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdatePaymentDto) {
		return this.paymentsService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.paymentsService.remove(id);
	}
}
