import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

interface OrderItem {
	vegetableId?: number;
	name?: string;
	quantity: number;
	unit: string;
}

@Injectable()
export class AnalyticsService {
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * KPI summary for a date range.
	 * MISSED is computed: deliveryDate < today AND status not DELIVERED/CANCELLED.
	 */
	async getSummary(from?: string, to?: string) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const where: any = {};
		if (from || to) {
			where.deliveryDate = {};
			if (from) where.deliveryDate.gte = new Date(from);
			if (to) {
				const toDate = new Date(to);
				toDate.setHours(23, 59, 59, 999);
				where.deliveryDate.lte = toDate;
			}
		}

		const orders = await this.prisma.order.findMany({
			where,
			select: { status: true, deliveryDate: true },
		});

		let totalOrders = 0;
		let delivered = 0;
		let cancelled = 0;
		let missed = 0;

		for (const o of orders) {
			totalOrders++;
			if (o.status === "DELIVERED") {
				delivered++;
			} else if (o.status === "CANCELLED") {
				cancelled++;
			} else if (o.deliveryDate < today) {
				missed++;
			}
		}

		return { totalOrders, delivered, missed, cancelled };
	}

	/**
	 * All missed deliveries: past orders that are not DELIVERED or CANCELLED.
	 */
	async getMissedDeliveries() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const orders = await this.prisma.order.findMany({
			where: {
				deliveryDate: { lt: today },
				status: { notIn: ["DELIVERED", "CANCELLED"] },
			},
			include: { customer: { select: { name: true } } },
			orderBy: { deliveryDate: "desc" },
		});

		return orders.map((o) => ({
			id: o.id,
			customerName: o.customer.name,
			deliveryDate: o.deliveryDate,
			items: this.formatItems(o.items),
		}));
	}

	/**
	 * Order count per day for the last N days.
	 */
	async getTrend(days = 7) {
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		const start = new Date();
		start.setDate(start.getDate() - days + 1);
		start.setHours(0, 0, 0, 0);

		const orders = await this.prisma.order.findMany({
			where: { deliveryDate: { gte: start, lte: end } },
			select: { deliveryDate: true },
			orderBy: { deliveryDate: "asc" },
		});

		// Build a map with all days in range initialised to 0
		const map = new Map<string, number>();
		const cursor = new Date(start);
		while (cursor <= end) {
			map.set(cursor.toISOString().slice(0, 10), 0);
			cursor.setDate(cursor.getDate() + 1);
		}

		for (const o of orders) {
			const key = o.deliveryDate.toISOString().slice(0, 10);
			map.set(key, (map.get(key) ?? 0) + 1);
		}

		return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
	}

	/**
	 * Top vegetables by total ordered quantity.
	 * Aggregates from the JSON items array across all orders.
	 */
	async getTopVegetables(limit = 5) {
		const orders = await this.prisma.order.findMany({
			select: { items: true },
		});

		const qtyMap = new Map<string, number>();

		for (const order of orders) {
			const items = order.items as unknown as OrderItem[];
			if (!Array.isArray(items)) continue;

			for (const item of items) {
				const name = item.name ?? "Unknown";
				qtyMap.set(name, (qtyMap.get(name) ?? 0) + (item.quantity ?? 0));
			}
		}

		return Array.from(qtyMap.entries())
			.map(([vegetableName, totalQty]) => ({ vegetableName, totalQty }))
			.sort((a, b) => b.totalQty - a.totalQty)
			.slice(0, limit);
	}

	/** Format raw JSON items into a readable string */
	private formatItems(items: unknown): string {
		const arr = items as { name?: string; quantity?: number; unit?: string }[];
		if (!Array.isArray(arr) || arr.length === 0) return "";
		return arr
			.map((i) =>
				`${i.name ?? "Item"} (${i.quantity ?? ""} ${i.unit ?? ""})`.trim(),
			)
			.join(", ");
	}
}
