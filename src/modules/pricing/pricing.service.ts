import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateVegetablePricesDto } from "./dto/index.js";
import { CostCalculationService } from "./cost-calculation.service.js";

@Injectable()
export class PricingService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly costCalc: CostCalculationService,
	) {}

	/**
	 * Upsert vegetable prices for a given date, then trigger cost recalculation.
	 */
	async upsertPrices(dto: CreateVegetablePricesDto) {
		const dateObj = new Date(dto.date);
		// Normalise to start-of-day UTC
		dateObj.setUTCHours(0, 0, 0, 0);

		const upserts = dto.prices.map((p) =>
			this.prisma.vegetablePrice.upsert({
				where: {
					vegetableId_date: {
						vegetableId: p.vegetableId,
						date: dateObj,
					},
				},
				create: {
					vegetableId: p.vegetableId,
					price: p.price,
					date: dateObj,
				},
				update: {
					price: p.price,
				},
			}),
		);

		const saved = await this.prisma.$transaction(upserts);

		// Trigger cost calculation for this date
		await this.costCalc.calculateCostsForDate(dateObj);

		return saved;
	}

	/**
	 * Get all vegetable prices for a specific date.
	 */
	async getPricesByDate(date: string) {
		const dateObj = new Date(date);
		dateObj.setUTCHours(0, 0, 0, 0);

		return this.prisma.vegetablePrice.findMany({
			where: { date: dateObj },
			include: {
				vegetable: {
					select: { id: true, name: true, hindiName: true, unit: true },
				},
			},
			orderBy: { vegetable: { name: "asc" } },
		});
	}
}
