import { Module } from "@nestjs/common";
import { KitchenGardenService } from "./kitchen-garden.service.js";
import { KitchenGardenController } from "./kitchen-garden.controller.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
	imports: [AuthModule],
	controllers: [KitchenGardenController],
	providers: [KitchenGardenService],
	exports: [KitchenGardenService],
})
export class KitchenGardenModule {}
