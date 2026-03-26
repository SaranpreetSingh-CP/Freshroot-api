import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	ParseIntPipe,
} from "@nestjs/common";
import { CustomersService } from "./customers.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";
import { OrdersService } from "../orders/orders.service.js";

@Controller("customers")
export class CustomersController {
	constructor(
		private readonly customersService: CustomersService,
		private readonly ordersService: OrdersService,
	) {}

	@Post()
	create(@Body() dto: CreateCustomerDto) {
		return this.customersService.create(dto);
	}

	@Get()
	findAll() {
		return this.customersService.findAll();
	}

	@Get(":id/details")
	getDetails(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.getCustomerDetails(id);
	}

	@Get(":id/delivered-orders")
	getDeliveredOrders(@Param("id", ParseIntPipe) id: number) {
		return this.ordersService.getDeliveredOrders(id);
	}

	@Get(":id/upcoming-deliveries")
	getUpcomingDeliveries(
		@Param("id", ParseIntPipe) id: number,
		@Query("limit") limit?: string,
	) {
		return this.ordersService.getUpcomingDeliveries(
			id,
			limit ? parseInt(limit, 10) : undefined,
		);
	}

	@Get(":id/plan-usage")
	getPlanUsage(@Param("id", ParseIntPipe) id: number) {
		return this.ordersService.getPlanUsage(id);
	}

	@Get(":id/plan")
	getPlan(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.getPlan(id);
	}

	@Get(":id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.findOne(id);
	}

	@Patch(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateCustomerDto,
	) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.remove(id);
	}
}
