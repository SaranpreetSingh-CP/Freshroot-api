import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";

@Injectable()
export class CustomersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCustomerDto) {
		const { subscription, ...customerData } = dto;

		if (!subscription) {
			const customer = await this.prisma.customer.create({
				data: customerData,
				include: { subscriptions: true },
			});
			return { customer, subscription: null };
		}

		// Use a transaction to create customer + subscription atomically
		const result = await this.prisma.$transaction(async (tx) => {
			const customer = await tx.customer.create({ data: customerData });

			const subData: any = {
				customerId: customer.id,
				type: subscription.type,
				package: subscription.package,
				offerPrice: subscription.offerPrice,
				status: subscription.status ?? "active",
			};
			if (subscription.actualPrice != null)
				subData.actualPrice = subscription.actualPrice;
			if (subscription.paymentTerms)
				subData.paymentTerms = subscription.paymentTerms;
			if (subscription.totalQuantity != null)
				subData.totalQuantity = subscription.totalQuantity;
			if (subscription.totalDeliveries != null)
				subData.totalDeliveries = subscription.totalDeliveries;
			if (subscription.startDate)
				subData.startDate = new Date(subscription.startDate);
			if (subscription.endDate)
				subData.endDate = new Date(subscription.endDate);
			if (subscription.remarks) subData.remarks = subscription.remarks;

			const sub = await tx.subscription.create({ data: subData });

			return { customer, subscription: sub };
		});

		return result;
	}

	async findAll() {
		return this.prisma.customer.findMany({
			include: { subscriptions: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async getCustomerDetails(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
		});
		if (!customer) throw new NotFoundException("Customer not found");

		const [subscriptions, pastOrders] = await Promise.all([
			this.prisma.subscription.findMany({
				where: { customerId: id },
				select: {
					id: true,
					type: true,
					package: true,
					status: true,
					startDate: true,
				},
			}),
			this.prisma.order.findMany({
				where: {
					customerId: id,
					status: { in: ["DELIVERED", "CANCELLED", "SKIPPED"] },
				},
				orderBy: { deliveryDate: "desc" },
				select: {
					id: true,
					items: true,
					totalAmount: true,
					deliveryDate: true,
					status: true,
				},
			}),
		]);

		return {
			customer: {
				id: customer.id,
				name: customer.name,
				email: customer.email,
				phone: customer.phone,
				address: customer.address,
				createdAt: customer.createdAt,
			},
			subscriptions,
			pastOrders: pastOrders.map((o) => ({
				id: o.id,
				items: o.items,
				total: o.totalAmount,
				date: o.deliveryDate,
				status: o.status,
			})),
		};
	}

	async findOne(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			include: {
				subscriptions: {
					include: { kitchenGarden: true, deliveries: true },
				},
				orders: true,
				payments: true,
			},
		});
		if (!customer) throw new NotFoundException("Customer not found");
		return customer;
	}

	async update(id: number, dto: UpdateCustomerDto) {
		await this.findOne(id);

		const { subscription, ...customerData } = dto;

		// Update customer fields
		const customer = await this.prisma.customer.update({
			where: { id },
			data: customerData,
			include: { subscriptions: true },
		});

		let updatedSub: any = null;

		if (subscription) {
			const subData: any = { ...subscription };
			delete subData.id;
			if (subscription.startDate)
				subData.startDate = new Date(subscription.startDate);
			if (subscription.endDate)
				subData.endDate = new Date(subscription.endDate);
			if (subscription.nextRenewal)
				subData.nextRenewal = new Date(subscription.nextRenewal);

			if (subscription.id) {
				// Update existing subscription
				updatedSub = await this.prisma.subscription.update({
					where: { id: subscription.id },
					data: subData,
				});
			} else {
				// Create new subscription for this customer
				subData.customerId = id;
				updatedSub = await this.prisma.subscription.create({
					data: subData,
				});
			}
		}

		return { customer, subscription: updatedSub };
	}

	async remove(id: number) {
		await this.findOne(id);
		await this.prisma.customer.delete({ where: { id } });
		return { message: "Customer deleted successfully" };
	}
}
