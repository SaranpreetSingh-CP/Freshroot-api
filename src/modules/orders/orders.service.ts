import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateOrderDto, UpdateOrderDto } from "./dto/index.js";
import type { Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateOrderDto) {
		// Normalize item names: accept both "name" and "itemName"
		const normalizedItems = dto.items.map((item) => ({
			name: item.name ?? item.itemName ?? "",
			quantity: item.quantity,
			unit: item.unit,
		}));

		// Auto-calculate totalAmount if not provided
		const totalAmount = dto.totalAmount ?? 0;

		return this.prisma.order.create({
			data: {
				customerId: dto.customerId,
				items: normalizedItems as unknown as Prisma.InputJsonValue,
				totalAmount,
				status: dto.status ?? "pending",
				deliveryDate: dto.deliveryDate
					? new Date(dto.deliveryDate)
					: new Date(),
				notes: dto.notes,
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
