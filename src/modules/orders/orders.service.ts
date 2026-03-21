import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateOrderDto, UpdateOrderDto } from "./dto/index.js";

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateOrderDto) {
		return this.prisma.order.create({
			data: {
				...dto,
				deliveryDate: new Date(dto.deliveryDate),
			},
		});
	}

	async findAll() {
		return this.prisma.order.findMany({
			include: { customer: true, deliveries: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const order = await this.prisma.order.findUnique({
			where: { id },
			include: { customer: true, deliveries: true },
		});
		if (!order) throw new NotFoundException("Order not found");
		return order;
	}

	async update(id: string, dto: UpdateOrderDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);
		return this.prisma.order.update({ where: { id }, data });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.order.delete({ where: { id } });
		return { message: "Order deleted successfully" };
	}
}
