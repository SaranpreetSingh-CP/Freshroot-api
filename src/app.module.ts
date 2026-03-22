import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { CustomersModule } from "./modules/customers/customers.module.js";
import { OrdersModule } from "./modules/orders/orders.module.js";
import { DeliveriesModule } from "./modules/deliveries/deliveries.module.js";
import { KitchenGardenModule } from "./modules/kitchen-garden/kitchen-garden.module.js";
import { ExpensesModule } from "./modules/expenses/expenses.module.js";
import { PaymentsModule } from "./modules/payments/payments.module.js";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module.js";
import { DashboardModule } from "./modules/dashboard/dashboard.module.js";
import { AdminModule } from "./modules/admin/admin.module.js";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule,
		UsersModule,
		CustomersModule,
		SubscriptionsModule,
		OrdersModule,
		DeliveriesModule,
		KitchenGardenModule,
		ExpensesModule,
		PaymentsModule,
		DashboardModule,
		AdminModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
