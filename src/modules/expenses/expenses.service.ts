import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateExpenseDto, UpdateExpenseDto } from "./dto/index.js";
import { unlink } from "fs/promises";
import { join } from "path";

@Injectable()
export class ExpensesService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateExpenseDto) {
		return this.prisma.expense.create({
			data: {
				...dto,
				date: new Date(dto.date),
			},
		});
	}

	async findAll() {
		return this.prisma.expense.findMany({
			orderBy: { date: "desc" },
		});
	}

	async findOne(id: string) {
		const expense = await this.prisma.expense.findUnique({ where: { id } });
		if (!expense) throw new NotFoundException("Expense not found");
		return expense;
	}

	async update(id: string, dto: UpdateExpenseDto) {
		const existing = await this.findOne(id);
		const data: any = { ...dto };
		if (dto.date) data.date = new Date(dto.date);

		// If a new bill file is uploaded, try to delete the old one
		if (dto.billUrl && existing.billUrl) {
			try {
				await unlink(join(process.cwd(), existing.billUrl));
			} catch {
				// old file may not exist, ignore
			}
		}

		return this.prisma.expense.update({ where: { id }, data });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.expense.delete({ where: { id } });
		return { message: "Expense deleted successfully" };
	}
}
