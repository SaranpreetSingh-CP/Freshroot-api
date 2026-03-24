import { Module } from "@nestjs/common";
import { PricingController } from "./pricing.controller.js";
import { PricingService } from "./pricing.service.js";
import { CostCalculationService } from "./cost-calculation.service.js";

@Module({
	controllers: [PricingController],
	providers: [PricingService, CostCalculationService],
	exports: [CostCalculationService],
})
export class PricingModule {}
