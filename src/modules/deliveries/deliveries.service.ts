import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateDeliveryDto, UpdateDeliveryDto } from "./dto/index.js";

@Injectable()
export class DeliveriesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateDeliveryDto) {
		const data: any = { ...dto };
		data.date = new Date(dto.date);
		return this.prisma.delivery.create({
			data,
			include: { subscription: { include: { customer: true } } },
		});
	}

	async findAll() {
		return this.prisma.delivery.findMany({
			include: { subscription: { include: { customer: true } } },
			orderBy: { date: "desc" },
		});
	}

	async findOne(id: string) {
		const delivery = await this.prisma.delivery.findUnique({
			where: { id },
			include: { subscription: { include: { customer: true } } },
		});
		if (!delivery) throw new NotFoundException("Delivery not found");
		return delivery;
	}

	async update(id: string, dto: UpdateDeliveryDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.date) data.date = new Date(dto.date);
		return this.prisma.delivery.update({
			where: { id },
			data,
			include: { subscription: { include: { customer: true } } },
		});
	}

	async updateStatus(id: string, status: string) {
		await this.findOne(id);
		return this.prisma.delivery.update({
			where: { id },
			data: { status },
			include: { subscription: { include: { customer: true } } },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.delivery.delete({ where: { id } });
		return { message: "Delivery deleted successfully" };
	}
}
