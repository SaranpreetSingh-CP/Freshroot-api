import { Controller, Get } from "@nestjs/common";
import { AdminService } from "./admin.service.js";

@Controller("admin")
export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	@Get("dashboard")
	getDashboard() {
		return this.adminService.getDashboard();
	}

	@Get("upcoming-deliveries")
	getUpcomingDeliveries() {
		return this.adminService.getUpcomingDeliveries();
	}

	@Get("orders-by-date")
	getOrdersByDate() {
		return this.adminService.getOrdersByDate();
	}
}
