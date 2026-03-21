import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateDeliveryDto, UpdateDeliveryDto } from "./dto/index.js";

@Injectable()
export class DeliveriesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateDeliveryDto) {
		const data: any = { ...dto };
		if (dto.deliveredAt) data.deliveredAt = new Date(dto.deliveredAt);
		return this.prisma.delivery.create({
			data,
			include: { order: true, address: true },
		});
	}

	async findAll() {
		return this.prisma.delivery.findMany({
			include: { order: { include: { customer: true } }, address: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const delivery = await this.prisma.delivery.findUnique({
			where: { id },
			include: { order: { include: { customer: true } }, address: true },
		});
		if (!delivery) throw new NotFoundException("Delivery not found");
		return delivery;
	}

	async update(id: string, dto: UpdateDeliveryDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.deliveredAt) data.deliveredAt = new Date(dto.deliveredAt);
		return this.prisma.delivery.update({
			where: { id },
			data,
			include: { order: true, address: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.delivery.delete({ where: { id } });
		return { message: "Delivery deleted successfully" };
	}
}
