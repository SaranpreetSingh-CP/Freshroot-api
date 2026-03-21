import { Module } from "@nestjs/common";
import { DeliveriesService } from "./deliveries.service.js";
import { DeliveriesController } from "./deliveries.controller.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
	imports: [AuthModule],
	controllers: [DeliveriesController],
	providers: [DeliveriesService],
	exports: [DeliveriesService],
})
export class DeliveriesModule {}
