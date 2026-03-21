import { Module } from "@nestjs/common";
import { KitchenGardenService } from "./kitchen-garden.service.js";
import { KitchenGardenController } from "./kitchen-garden.controller.js";

@Module({
	controllers: [KitchenGardenController],
	providers: [KitchenGardenService],
	exports: [KitchenGardenService],
})
export class KitchenGardenModule {}
