import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) {}

	async getCustomerDashboard(customerId: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id: customerId },
			include: {
				subscriptions: {
					include: {
						deliveries: {
							orderBy: { date: "desc" },
						},
					},
				},
			},
		});

		if (!customer) {
			throw new NotFoundException(`Customer #${customerId} not found`);
		}

		const now = new Date();

		// ─── Flatten all deliveries across subscriptions ──────────
		const allDeliveries = customer.subscriptions.flatMap((s) => s.deliveries);

		// ─── Summary ─────────────────────────────────────────────
		const activePlans = customer.subscriptions.filter(
			(s) => s.status === "active",
		).length;

		const upcomingDeliveries = allDeliveries.filter(
			(d) => new Date(d.date) > now,
		).length;

		const itemsDelivered = allDeliveries.filter(
			(d) => d.status === "delivered",
		).length;

		// ─── Subscriptions with next delivery ────────────────────
		const subscriptions = customer.subscriptions.map((s) => {
			const upcoming = s.deliveries
				.filter((d) => new Date(d.date) > now)
				.sort(
					(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
				);

			return {
				id: s.id,
				name: `${s.package} (${s.type})`,
				type: s.type,
				status: s.status,
				startDate: s.startDate,
				nextDelivery: upcoming.length > 0 ? upcoming[0].date : null,
			};
		});

		// ─── Recent deliveries ───────────────────────────────────
		const deliveries = allDeliveries.map((d) => ({
			date: d.date,
			items: [`${d.deliveredQty} kg`],
			status: d.status,
		}));

		return {
			summary: { activePlans, upcomingDeliveries, itemsDelivered },
			subscriptions,
			deliveries,
		};
	}
}
