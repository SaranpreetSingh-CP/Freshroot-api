import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { getComputedStatus } from "../orders/dto/index.js";

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	/** Format raw JSON items into a readable comma-separated string */
	private formatItems(items: unknown): string {
		const arr = items as { name?: string; quantity?: number; unit?: string }[];
		if (!Array.isArray(arr) || arr.length === 0) return "";
		return arr
			.map((i) =>
				`${i.name ?? "Item"} (${i.quantity ?? ""} ${i.unit ?? ""})`.trim(),
			)
			.join(", ");
	}

	/**
	 * Upcoming deliveries: all orders with deliveryDate >= start of today.
	 */
	async getUpcomingDeliveries() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const orders = await this.prisma.order.findMany({
			where: { deliveryDate: { gte: today } },
			include: { customer: { select: { name: true, phone: true } } },
			orderBy: { deliveryDate: "asc" },
		});

		return orders.map((o) => ({
			id: o.id,
			customerName: o.customer.name,
			phone: o.customer.phone,
			items: this.formatItems(o.items),
			total: o.totalAmount,
			date: o.deliveryDate,
			status: o.status,
			computedStatus: getComputedStatus(o),
		}));
	}

	/**
	 * Past orders (deliveryDate < today) grouped by date, sorted DESC.
	 */
	async getOrdersByDate() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const orders = await this.prisma.order.findMany({
			where: { deliveryDate: { lt: today } },
			include: { customer: { select: { name: true, phone: true } } },
			orderBy: { deliveryDate: "desc" },
		});

		const grouped = new Map<string, any[]>();

		for (const o of orders) {
			const dateKey = o.deliveryDate.toISOString().slice(0, 10);
			if (!grouped.has(dateKey)) grouped.set(dateKey, []);
			grouped.get(dateKey)!.push({
				id: o.id,
				customerName: o.customer.name,
				phone: o.customer.phone,
				items: this.formatItems(o.items),
				total: o.totalAmount,
				cost: o.cost,
				status: o.status,
				computedStatus: getComputedStatus(o),
			});
		}

		return Array.from(grouped.entries()).map(([date, orders]) => ({
			date,
			orders,
		}));
	}

	async getDashboard() {
		const [
			totalCustomers,
			activeCustomers,
			revenueAgg,
			expensesAgg,
			customers,
			orders,
			expenses,
		] = await Promise.all([
			// ─── Total customers ──────────────────────────────────
			this.prisma.customer.count(),

			// ─── Active customers (at least one active subscription)
			this.prisma.customer.count({
				where: { subscriptions: { some: { status: "active" } } },
			}),

			// ─── Revenue (sum of delivered orders) ────────────────
			this.prisma.order.aggregate({
				_sum: { totalAmount: true },
				where: { status: "delivered" },
			}),

			// ─── Expenses total ───────────────────────────────────
			this.prisma.expense.aggregate({
				_sum: { amount: true },
			}),

			// ─── Customers with latest subscription ───────────────
			this.prisma.customer.findMany({
				include: {
					subscriptions: {
						orderBy: { createdAt: "desc" },
						take: 1,
					},
				},
				orderBy: { createdAt: "desc" },
			}),

			// ─── Orders with customer name ────────────────────────
			this.prisma.order.findMany({
				include: { customer: true },
				orderBy: { createdAt: "desc" },
			}),

			// ─── All expenses ─────────────────────────────────────
			this.prisma.expense.findMany({
				orderBy: { date: "desc" },
			}),
		]);

		return {
			summary: {
				totalCustomers,
				activeCustomers,
				revenue: revenueAgg._sum.totalAmount ?? 0,
				expenses: expensesAgg._sum.amount ?? 0,
			},

			customers: customers.map((c) => {
				const latest = c.subscriptions[0] ?? null;
				return {
					id: c.id,
					name: c.name,
					email: c.email,
					phone: c.phone,
					plan: latest?.package ?? null,
					joined: c.createdAt,
					status: latest?.status === "active" ? "active" : "inactive",
				};
			}),

			orders: orders.map((o) => ({
				id: o.id,
				customerName: o.customer.name,
				items: (o.items as { name: string }[]).map((i) => i.name),
				total: o.totalAmount,
				date: o.deliveryDate,
				status: o.status,
				computedStatus: getComputedStatus(o),
			})),

			expenses: expenses.map((e) => ({
				category: e.category,
				description: e.description,
				amount: e.amount,
				date: e.date,
			})),
		};
	}
}
