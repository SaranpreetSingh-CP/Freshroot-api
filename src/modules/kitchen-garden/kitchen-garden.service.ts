import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
	CreateKitchenGardenDto,
	UpdateKitchenGardenDto,
	CreateKGVisitDto,
	UpdateKGVisitDto,
} from "./dto/index.js";

@Injectable()
export class KitchenGardenService {
	constructor(private readonly prisma: PrismaService) {}

	// ─── Kitchen Garden CRUD ────────────────────────────────────

	async create(dto: CreateKitchenGardenDto) {
		return this.prisma.kitchenGarden.create({
			data: {
				...dto,
				setupDate: new Date(dto.setupDate),
			},
		});
	}

	async findAll() {
		return this.prisma.kitchenGarden.findMany({
			include: { customer: true, visits: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const kg = await this.prisma.kitchenGarden.findUnique({
			where: { id },
			include: { customer: true, visits: { orderBy: { visitDate: "desc" } } },
		});
		if (!kg) throw new NotFoundException("Kitchen garden not found");
		return kg;
	}

	async update(id: string, dto: UpdateKitchenGardenDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.setupDate) data.setupDate = new Date(dto.setupDate);
		return this.prisma.kitchenGarden.update({ where: { id }, data });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.kitchenGarden.delete({ where: { id } });
		return { message: "Kitchen garden deleted successfully" };
	}

	// ─── KG Visit CRUD ─────────────────────────────────────────

	async createVisit(dto: CreateKGVisitDto) {
		return this.prisma.kGVisit.create({
			data: {
				...dto,
				visitDate: new Date(dto.visitDate),
			},
		});
	}

	async findAllVisits(kitchenGardenId: string) {
		return this.prisma.kGVisit.findMany({
			where: { kitchenGardenId },
			orderBy: { visitDate: "desc" },
		});
	}

	async findOneVisit(id: string) {
		const visit = await this.prisma.kGVisit.findUnique({ where: { id } });
		if (!visit) throw new NotFoundException("KG Visit not found");
		return visit;
	}

	async updateVisit(id: string, dto: UpdateKGVisitDto) {
		await this.findOneVisit(id);
		const data: any = { ...dto };
		if (dto.visitDate) data.visitDate = new Date(dto.visitDate);
		return this.prisma.kGVisit.update({ where: { id }, data });
	}

	async removeVisit(id: string) {
		await this.findOneVisit(id);
		await this.prisma.kGVisit.delete({ where: { id } });
		return { message: "KG Visit deleted successfully" };
	}
}
