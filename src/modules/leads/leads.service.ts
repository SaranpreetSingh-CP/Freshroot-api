import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateLeadDto, UpdateLeadStatusDto } from "./dto/index.js";

@Injectable()
export class LeadsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateLeadDto) {
		const lead = await this.prisma.lead.create({ data: dto });

		// Optional: generate WhatsApp notification link
		const adminPhone = process.env.WHATSAPP_PHONE;
		const whatsappLink = adminPhone
			? `https://wa.me/${adminPhone}?text=${encodeURIComponent(`New Lead: ${lead.name} (${lead.phone})`)}`
			: null;

		return {
			success: true,
			message: "Quote request submitted",
			lead,
			whatsappLink,
		};
	}

	async findAll() {
		return this.prisma.lead.findMany({
			orderBy: { createdAt: "desc" },
		});
	}

	async findOne(id: string) {
		const lead = await this.prisma.lead.findUnique({ where: { id } });
		if (!lead) throw new NotFoundException(`Lead #${id} not found`);
		return lead;
	}

	async updateStatus(id: string, dto: UpdateLeadStatusDto) {
		await this.findOne(id); // ensure exists
		return this.prisma.lead.update({
			where: { id },
			data: { status: dto.status },
		});
	}
}
