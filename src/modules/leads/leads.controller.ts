import {
	Controller,
	Get,
	Post,
	Patch,
	Body,
	Param,
	UseGuards,
} from "@nestjs/common";
import { LeadsService } from "./leads.service.js";
import { CreateLeadDto, UpdateLeadStatusDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("leads")
export class LeadsController {
	constructor(private readonly leadsService: LeadsService) {}

	/** PUBLIC — anyone can submit a quote request */
	@Post()
	create(@Body() dto: CreateLeadDto) {
		return this.leadsService.create(dto);
	}

	/** ADMIN — list all leads (latest first) */
	@UseGuards(JwtAuthGuard)
	@Get()
	findAll() {
		return this.leadsService.findAll();
	}

	/** ADMIN — get single lead */
	@UseGuards(JwtAuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.leadsService.findOne(id);
	}

	/** ADMIN — update lead status */
	@UseGuards(JwtAuthGuard)
	@Patch(":id")
	updateStatus(@Param("id") id: string, @Body() dto: UpdateLeadStatusDto) {
		return this.leadsService.updateStatus(id, dto);
	}
}
