import { Controller, Get, Param, Query, ParseIntPipe } from "@nestjs/common";
import { VegetablesService } from "./vegetables.service.js";

@Controller("vegetables")
export class VegetablesController {
	constructor(private readonly vegetablesService: VegetablesService) {}

	/** GET /vegetables — return all vegetables */
	@Get()
	async findAll() {
		return this.vegetablesService.findAll();
	}

	/** GET /vegetables/available?month=3 — return vegetables available in given month (defaults to current) */
	@Get("available")
	async findAvailable(@Query("month") month?: string) {
		const m = month ? parseInt(month, 10) : undefined;
		return this.vegetablesService.findAvailable(m);
	}

	/** GET /vegetables/:id — return single vegetable with availability */
	@Get(":id")
	async findOne(@Param("id", ParseIntPipe) id: number) {
		return this.vegetablesService.findOne(id);
	}
}
