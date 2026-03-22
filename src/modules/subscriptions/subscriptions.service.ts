import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateSubscriptionDto, UpdateSubscriptionDto } from "./dto/index.js";

@Injectable()
export class SubscriptionsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateSubscriptionDto) {
		const data: any = { ...dto };
		if (dto.startDate) data.startDate = new Date(dto.startDate);
		if (dto.endDate) data.endDate = new Date(dto.endDate);
		if (dto.nextRenewal) data.nextRenewal = new Date(dto.nextRenewal);
		return this.prisma.subscription.create({
			data,
			include: { customer: true },
		});
	}

	async findAll() {
		return this.prisma.subscription.findMany({
			include: { customer: true, kitchenGarden: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: number) {
		const subscription = await this.prisma.subscription.findUnique({
			where: { id },
			include: {
				customer: true,
				deliveries: { orderBy: { date: "desc" } },
				kitchenGarden: { include: { visits: true } },
			},
		});
		if (!subscription) throw new NotFoundException("Subscription not found");
		return subscription;
	}

	async findByCustomer(customerId: number) {
		return this.prisma.subscription.findMany({
			where: { customerId },
			include: { kitchenGarden: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async update(id: number, dto: UpdateSubscriptionDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.startDate) data.startDate = new Date(dto.startDate);
		if (dto.endDate) data.endDate = new Date(dto.endDate);
		if (dto.nextRenewal) data.nextRenewal = new Date(dto.nextRenewal);
		return this.prisma.subscription.update({
			where: { id },
			data,
			include: { customer: true },
		});
	}

	async remove(id: number) {
		await this.findOne(id);
		await this.prisma.subscription.delete({ where: { id } });
		return { message: "Subscription deleted successfully" };
	}
}
