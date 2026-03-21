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
			include: { addresses: true, subscriptions: true },
		});
	}

	async findOne(id: string) {
		const customer = await this.prisma.customer.findUnique({
			where: { id },
			include: {
				addresses: true,
				subscriptions: true,
				orders: true,
				kitchenGardens: true,
			},
		});
		if (!customer) throw new NotFoundException("Customer not found");
		return customer;
	}

	async update(id: string, dto: UpdateCustomerDto) {
		await this.findOne(id);
		return this.prisma.customer.update({ where: { id }, data: dto });
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.customer.delete({ where: { id } });
		return { message: "Customer deleted successfully" };
	}
}
