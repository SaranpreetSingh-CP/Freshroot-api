import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
} from "@nestjs/common";
import { OrdersService } from "./orders.service.js";
import {
	CreateOrderDto,
	UpdateOrderDto,
	UpdateOrderStatusDto,
} from "./dto/index.js";

@Controller("orders")
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

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateOrderDto) {
		return this.ordersService.update(id, dto);
	}

	@Patch(":id/status")
	updateStatus(@Param("id") id: string, @Body() dto: UpdateOrderStatusDto) {
		return this.ordersService.updateStatus(id, dto.status);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.ordersService.remove(id);
	}
}
