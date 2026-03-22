import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
} from "@nestjs/common";
import { DeliveriesService } from "./deliveries.service.js";
import {
	CreateDeliveryDto,
	UpdateDeliveryDto,
	UpdateDeliveryStatusDto,
} from "./dto/index.js";

@Controller("deliveries")
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

	@Patch(":id")
	update(@Param("id") id: string, @Body() dto: UpdateDeliveryDto) {
		return this.deliveriesService.update(id, dto);
	}

	@Patch(":id/status")
	updateStatus(@Param("id") id: string, @Body() dto: UpdateDeliveryStatusDto) {
		return this.deliveriesService.updateStatus(id, dto.status);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.deliveriesService.remove(id);
	}
}
