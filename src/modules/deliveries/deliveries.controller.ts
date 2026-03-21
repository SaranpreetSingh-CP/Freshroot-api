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
import { DeliveriesService } from "./deliveries.service.js";
import { CreateDeliveryDto, UpdateDeliveryDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("deliveries")
@UseGuards(JwtAuthGuard)
export class DeliveriesController {
	constructor(private readonly deliveriesService: DeliveriesService) {}

	@Post()
	create(@Body() dto: CreateDeliveryDto) {
		return this.deliveriesService.create(dto);
	}

	@Get()
	findAll() {
		return this.deliveriesService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.deliveriesService.findOne(id);
	}

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdateDeliveryDto) {
		return this.deliveriesService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.deliveriesService.remove(id);
	}
}
