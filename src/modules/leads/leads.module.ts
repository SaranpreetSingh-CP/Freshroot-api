import { Module } from "@nestjs/common";
import { LeadsService } from "./leads.service.js";
import { LeadsController } from "./leads.controller.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
	imports: [AuthModule],
	controllers: [LeadsController],
	providers: [LeadsService],
	exports: [LeadsService],
})
export class LeadsModule {}
