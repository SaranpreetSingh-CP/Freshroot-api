import { Module } from "@nestjs/common";
import { CustomersService } from "./customers.service.js";
import { CustomersController } from "./customers.controller.js";
import { AuthModule } from "../auth/auth.module.js";
import { OrdersModule } from "../orders/orders.module.js";

@Module({
	imports: [AuthModule, OrdersModule],
	controllers: [CustomersController],
	providers: [CustomersService],
	exports: [CustomersService],
})
export class CustomersModule {}
