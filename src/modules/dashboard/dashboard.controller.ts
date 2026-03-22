import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";

@Controller("dashboard")
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get("customer/:id")
	getCustomerDashboard(@Param("id", ParseIntPipe) id: number) {
		return this.dashboardService.getCustomerDashboard(id);
	}
}
