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
import { KitchenGardenService } from "./kitchen-garden.service.js";
import {
	CreateKitchenGardenDto,
	UpdateKitchenGardenDto,
	CreateKGVisitDto,
	UpdateKGVisitDto,
} from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("kg")
@UseGuards(JwtAuthGuard)
export class KitchenGardenController {
	constructor(private readonly kgService: KitchenGardenService) {}

	// ─── Kitchen Gardens ────────────────────────────────────────

	@Post()
	create(@Body() dto: CreateKitchenGardenDto) {
		return this.kgService.create(dto);
	}

	@Get()
	findAll() {
		return this.kgService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.kgService.findOne(id);
	}

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdateKitchenGardenDto) {
		return this.kgService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.kgService.remove(id);
	}

	// ─── KG Visits ──────────────────────────────────────────────

	@Post(":kgId/visits")
	createVisit(@Param("kgId") kgId: string, @Body() dto: CreateKGVisitDto) {
		dto.kitchenGardenId = kgId;
		return this.kgService.createVisit(dto);
	}

	@Get(":kgId/visits")
	findAllVisits(@Param("kgId") kgId: string) {
		return this.kgService.findAllVisits(kgId);
	}

	@Get("visits/:id")
	findOneVisit(@Param("id") id: string) {
		return this.kgService.findOneVisit(id);
	}

	@Put("visits/:id")
	updateVisit(@Param("id") id: string, @Body() dto: UpdateKGVisitDto) {
		return this.kgService.updateVisit(id, dto);
	}

	@Delete("visits/:id")
	removeVisit(@Param("id") id: string) {
		return this.kgService.removeVisit(id);
	}
}
