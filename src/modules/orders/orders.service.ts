import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
	CreateOrderDto,
	UpdateOrderDto,
	normalizeOrderStatus,
} from "./dto/index.js";
import type { Prisma } from "../../../generated/prisma/client.js";

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	/** Resolve & validate items — look up vegetableId if provided */
	private async resolveItems(items: CreateOrderDto["items"]) {
		const resolved: {
			vegetableId?: number;
			name: string;
			quantity: number;
			unit: string;
		}[] = [];

		for (const item of items) {
			if (item.vegetableId) {
				const veg = await this.prisma.vegetable.findUnique({
					where: { id: item.vegetableId },
				});
				if (!veg) {
					throw new BadRequestException(
						`Vegetable with id ${item.vegetableId} not found`,
					);
				}
				resolved.push({
					vegetableId: veg.id,
					name: item.name ?? veg.name,
					quantity: item.quantity,
					unit: item.unit,
				});
			} else {
				resolved.push({
					name: item.name ?? item.itemName ?? "",
					quantity: item.quantity,
					unit: item.unit,
				});
			}
		}
		return resolved;
	}

	async create(dto: CreateOrderDto) {
		const normalizedItems = await this.resolveItems(dto.items);
		const totalAmount = dto.total ?? dto.totalAmount ?? 0;
		const status = normalizeOrderStatus(dto.status) ?? "PENDING";

		return this.prisma.order.create({
			data: {
				customerId: dto.customerId,
				items: normalizedItems as unknown as Prisma.InputJsonValue,
				totalAmount,
				status,
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

		const data: any = {};

		if (dto.customerId != null) data.customerId = dto.customerId;
		if (dto.notes !== undefined) data.notes = dto.notes;
		if (dto.deliveryDate) data.deliveryDate = new Date(dto.deliveryDate);
		if (dto.status) data.status = normalizeOrderStatus(dto.status);

		// Handle total / totalAmount
		const total = dto.total ?? dto.totalAmount;
		if (total != null) data.totalAmount = total;

		// Handle items update with validation
		if (dto.items) {
			const resolvedItems = await this.resolveItems(dto.items);
			data.items = resolvedItems as unknown as Prisma.InputJsonValue;
		}

		return this.prisma.order.update({
			where: { id },
			data,
			include: { customer: true },
		});
	}

	async updateStatus(id: string, status: string) {
		await this.findOne(id);
		const normalized = normalizeOrderStatus(status) ?? status;
		return this.prisma.order.update({
			where: { id },
			data: { status: normalized },
			include: { customer: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.order.delete({ where: { id } });
		return { message: "Order deleted successfully" };
	}
}
