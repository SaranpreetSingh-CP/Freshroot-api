import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { PricingService } from "./pricing.service.js";
import { CreateVegetablePricesDto } from "./dto/index.js";

@Controller("vegetable-prices")
export class PricingController {
	constructor(private readonly pricingService: PricingService) {}

	@Post()
	create(@Body() dto: CreateVegetablePricesDto) {
		return this.pricingService.upsertPrices(dto);
	}

	@Get()
	findByDate(@Query("date") date: string) {
		return this.pricingService.getPricesByDate(date);
	}
}
