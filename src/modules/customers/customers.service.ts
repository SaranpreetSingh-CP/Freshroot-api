import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";

@Injectable()
export class CustomersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateCustomerDto) {
		return this.prisma.customer.create({ data: dto });
	}

	async findAll() {
		return this.prisma.customer.findMany({
			include: { subscriptions: true },
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: number) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			include: {
				subscriptions: {
					include: { kitchenGarden: true, deliveries: true },
				},
				orders: true,
				payments: true,
			},
		});
		if (!customer) throw new NotFoundException("Customer not found");
		return customer;
	}

	async update(id: number, dto: UpdateCustomerDto) {
		await this.findOne(id);
		return this.prisma.customer.update({ where: { id }, data: dto });
	}

	async remove(id: number) {
		await this.findOne(id);
		await this.prisma.customer.delete({ where: { id } });
		return { message: "Customer deleted successfully" };
	}
}
