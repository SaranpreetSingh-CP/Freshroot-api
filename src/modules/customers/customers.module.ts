import { Module } from "@nestjs/common";
import { CustomersService } from "./customers.service.js";
import { CustomersController } from "./customers.controller.js";
import { AuthModule } from "../auth/auth.module.js";

@Module({
	imports: [AuthModule],
	controllers: [CustomersController],
	providers: [CustomersService],
	exports: [CustomersService],
})
export class CustomersModule {}
