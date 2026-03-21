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
import { OrdersService } from "./orders.service.js";
import { CreateOrderDto, UpdateOrderDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	create(@Body() dto: CreateOrderDto) {
		return this.ordersService.create(dto);
	}

	@Get()
	findAll() {
		return this.ordersService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.ordersService.findOne(id);
	}

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
		return this.ordersService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.ordersService.remove(id);
	}
}
