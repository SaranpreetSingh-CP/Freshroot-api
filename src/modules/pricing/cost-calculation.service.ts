import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { convertToBaseUnit } from "./helpers/unit-conversion.js";

interface OrderItem {
	vegetableId?: number;
	name?: string;
	quantity: number;
	unit: string;
}

@Injectable()
export class CostCalculationService {
	private readonly logger = new Logger(CostCalculationService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Recalculate the `cost` field for every order on a given date.
	 *
	 * Steps:
	 *  1. Fetch all orders whose deliveryDate matches the date.
	 *  2. Fetch all vegetable prices for that date.
	 *  3. For each order, compute cost from item quantities × unit price.
	 *  4. Update each order's `cost` field. Set null if any price is missing.
	 */
	async calculateCostsForDate(date: Date) {
		// Normalise to start-of-day
		const startOfDay = new Date(date);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(startOfDay);
		endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

		const [orders, prices, vegetables] = await Promise.all([
			this.prisma.order.findMany({
				where: {
					deliveryDate: { gte: startOfDay, lt: endOfDay },
				},
			}),
			this.prisma.vegetablePrice.findMany({
				where: { date: startOfDay },
			}),
			this.prisma.vegetable.findMany({
				select: { id: true, unit: true },
			}),
		]);

		if (orders.length === 0) return;

		// Build lookup maps
		const priceMap = new Map<number, number>();
		for (const p of prices) {
			priceMap.set(p.vegetableId, p.price);
		}

		const baseUnitMap = new Map<number, string>();
		for (const v of vegetables) {
			baseUnitMap.set(v.id, v.unit);
		}

		// Calculate and batch-update
		const updates = orders.map((order) => {
			const items = order.items as unknown as OrderItem[];
			let cost: number | null = 0;

			for (const item of items) {
				if (!item.vegetableId) {
					cost = null;
					break;
				}

				const unitPrice = priceMap.get(item.vegetableId);
				if (unitPrice === undefined) {
					cost = null;
					break;
				}

				const baseUnit = baseUnitMap.get(item.vegetableId) ?? "kg";
				const normQty = convertToBaseUnit(
					item.quantity,
					item.unit ?? baseUnit,
					baseUnit,
				);
				cost! += normQty * unitPrice;
			}

			// Round to 2 decimals
			if (cost !== null) cost = Math.round(cost * 100) / 100;

			return this.prisma.order.update({
				where: { id: order.id },
				data: { cost },
			});
		});

		await this.prisma.$transaction(updates);

		this.logger.log(
			`Recalculated costs for ${updates.length} orders on ${startOfDay.toISOString().slice(0, 10)}`,
		);
	}
}
