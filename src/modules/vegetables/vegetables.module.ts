import { Module } from "@nestjs/common";
import { VegetablesController } from "./vegetables.controller.js";
import { VegetablesService } from "./vegetables.service.js";

@Module({
	controllers: [VegetablesController],
	providers: [VegetablesService],
	exports: [VegetablesService],
})
export class VegetablesModule {}
