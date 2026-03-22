import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class VegetablesService {
	constructor(private readonly prisma: PrismaService) {}

	async findAll() {
		return this.prisma.vegetable.findMany({
			orderBy: [{ category: "asc" }, { name: "asc" }],
		});
	}

	async findAvailable(month?: number) {
		const targetMonth = month ?? new Date().getMonth() + 1; // 1-based

		return this.prisma.vegetable.findMany({
			where: {
				availability: {
					some: { month: targetMonth },
				},
			},
			orderBy: [{ category: "asc" }, { name: "asc" }],
			select: {
				id: true,
				name: true,
				hindiName: true,
				unit: true,
				category: true,
			},
		});
	}

	async findOne(id: number) {
		return this.prisma.vegetable.findUnique({
			where: { id },
			include: { availability: true },
		});
	}
}
