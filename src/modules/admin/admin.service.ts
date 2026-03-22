import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

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
