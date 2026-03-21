import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateExpenseDto, UpdateExpenseDto } from "./dto/index.js";

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
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.date) data.date = new Date(dto.date);
		return this.prisma.expense.update({ where: { id }, data });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.expense.delete({ where: { id } });
		return { message: "Expense deleted successfully" };
	}
}
