import { Controller, Get, Query } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service.js";

@Controller("analytics")
export class AnalyticsController {
	constructor(private readonly analyticsService: AnalyticsService) {}

	/** GET /analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD */
	@Get("summary")
	getSummary(@Query("from") from?: string, @Query("to") to?: string) {
		return this.analyticsService.getSummary(from, to);
	}

	/** GET /analytics/missed */
	@Get("missed")
	getMissedDeliveries() {
		return this.analyticsService.getMissedDeliveries();
	}

	/** GET /analytics/trend?days=7 */
	@Get("trend")
	getTrend(@Query("days") days?: string) {
		return this.analyticsService.getTrend(days ? parseInt(days, 10) : 7);
	}

	/** GET /analytics/top-vegetables?limit=5 */
	@Get("top-vegetables")
	getTopVegetables(@Query("limit") limit?: string) {
		return this.analyticsService.getTopVegetables(
			limit ? parseInt(limit, 10) : 5,
		);
	}
}
