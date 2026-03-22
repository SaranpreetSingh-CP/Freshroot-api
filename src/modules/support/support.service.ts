import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
	CreateTicketDto,
	CreateMessageDto,
	UpdateTicketStatusDto,
} from "./dto/index.js";

@Injectable()
export class SupportService {
	constructor(private readonly prisma: PrismaService) {}

	async createTicket(dto: CreateTicketDto, imageUrl?: string) {
		return this.prisma.supportTicket.create({
			data: {
				...(dto.customerId ? { customerId: dto.customerId } : {}),
				deliveryId: dto.deliveryId ?? null,
				deliveryInfo: dto.deliveryInfo ?? null,
				issueType: dto.issueType,
				description: dto.description,
				imageUrl: imageUrl ?? null,
			},
			include: { customer: true, delivery: true, messages: true },
		});
	}

	async findAll() {
		return this.prisma.supportTicket.findMany({
			include: {
				customer: true,
				delivery: true,
				messages: { orderBy: { createdAt: "asc" } },
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const ticket = await this.prisma.supportTicket.findUnique({
			where: { id },
			include: {
				customer: true,
				delivery: true,
				messages: { orderBy: { createdAt: "asc" } },
			},
		});
		if (!ticket) {
			throw new NotFoundException(`Ticket ${id} not found`);
		}
		return ticket;
	}

	async findByCustomer(customerId: number) {
		return this.prisma.supportTicket.findMany({
			where: { customerId },
			include: {
				delivery: true,
				messages: { orderBy: { createdAt: "asc" } },
			},
			orderBy: { createdAt: "desc" },
		});
	}

	async addMessage(ticketId: string, dto: CreateMessageDto) {
		// Ensure ticket exists
		await this.findOne(ticketId);
		return this.prisma.supportMessage.create({
			data: {
				ticketId,
				sender: dto.sender,
				message: dto.message,
			},
		});
	}

	async updateStatus(id: string, dto: UpdateTicketStatusDto) {
		await this.findOne(id);
		return this.prisma.supportTicket.update({
			where: { id },
			data: { status: dto.status },
			include: { customer: true, messages: true },
		});
	}
}
