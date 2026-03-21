import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreatePaymentDto, UpdatePaymentDto } from "./dto/index.js";

@Injectable()
export class PaymentsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreatePaymentDto) {
		return this.prisma.payment.create({
			data: {
				...dto,
				date: new Date(dto.date),
			},
			include: { customer: true },
		});
	}

	async findAll() {
		return this.prisma.payment.findMany({
			include: { customer: true },
			orderBy: { date: "desc" },
		});
	}

	async findOne(id: string) {
		const payment = await this.prisma.payment.findUnique({
			where: { id },
			include: { customer: true },
		});
		if (!payment) throw new NotFoundException("Payment not found");
		return payment;
	}

	async update(id: string, dto: UpdatePaymentDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.date) data.date = new Date(dto.date);
		return this.prisma.payment.update({
			where: { id },
			data,
			include: { customer: true },
		});
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.payment.delete({ where: { id } });
		return { message: "Payment deleted successfully" };
	}
}
