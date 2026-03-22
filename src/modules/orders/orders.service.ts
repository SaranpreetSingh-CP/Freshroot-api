import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateOrderDto, UpdateOrderDto } from "./dto/index.js";
import type { Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateOrderDto) {
		return this.prisma.order.create({
			data: {
				...dto,
				items: dto.items as unknown as Prisma.InputJsonValue,
				deliveryDate: new Date(dto.deliveryDate),
			},
			include: { customer: true },
		});
	}

	async findAll() {
		return this.prisma.order.findMany({
			include: { customer: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { customer: true },
		});
		if (!order) throw new NotFoundException("Order not found");
		return order;
	}

	async update(id: string, dto: UpdateOrderDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);
		return this.prisma.order.update({
			where: { id },
			data,
			include: { customer: true },
		});
	}

	async updateStatus(id: string, status: string) {
		await this.findOne(id);
		return this.prisma.order.update({
			where: { id },
			data: { status },
			include: { customer: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.order.delete({ where: { id } });
		return { message: "Order deleted successfully" };
	}
}
