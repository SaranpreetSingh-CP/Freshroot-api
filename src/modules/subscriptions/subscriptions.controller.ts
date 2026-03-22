import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	ParseIntPipe,
	UseGuards,
} from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service.js";
import { CreateSubscriptionDto, UpdateSubscriptionDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
	constructor(private readonly subscriptionsService: SubscriptionsService) {}

	@Post()
	create(@Body() dto: CreateSubscriptionDto) {
		return this.subscriptionsService.create(dto);
	}

	@Get()
	findAll() {
		return this.subscriptionsService.findAll();
	}

	@Get(":id")
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.subscriptionsService.findOne(id);
	}

	@Get("customer/:customerId")
	findByCustomer(@Param("customerId", ParseIntPipe) customerId: number) {
		return this.subscriptionsService.findByCustomer(customerId);
	}

	@Put(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateSubscriptionDto,
	) {
		return this.subscriptionsService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.subscriptionsService.remove(id);
	}
}
