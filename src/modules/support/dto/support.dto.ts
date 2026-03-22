import { IsString, IsNotEmpty, IsIn, IsOptional, IsInt } from "class-validator";
import { Transform } from "class-transformer";

export const ISSUE_TYPES = [
	"MISSING_ITEM",
	"LATE_DELIVERY",
	"QUALITY_ISSUE",
	"OTHER",
] as const;

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

export const SENDER_TYPES = ["CUSTOMER", "ADMIN"] as const;

/** Map frontend kebab-case / lowercase issue types to canonical format */
export function normalizeIssueType(raw: string): string {
	const map: Record<string, string> = {
		"missing-item": "MISSING_ITEM",
		"late-delivery": "LATE_DELIVERY",
		"quality-issue": "QUALITY_ISSUE",
		other: "OTHER",
	};
	return map[raw?.toLowerCase()] ?? raw?.toUpperCase().replace(/-/g, "_") ?? raw;
}

export class CreateTicketDto {
	@IsOptional()
	@IsInt()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	customerId?: number;

	@IsOptional()
	@IsString()
	deliveryId?: string;

	@IsOptional()
	@IsString()
	deliveryInfo?: string;

	@IsString()
	@IsNotEmpty()
	issueType!: string;

	@IsString()
	@IsNotEmpty()
	description!: string;
}

export class CreateMessageDto {
	@IsString()
	@IsNotEmpty()
	@IsIn(SENDER_TYPES as unknown as string[])
	sender!: string;

	@IsString()
	@IsNotEmpty()
	message!: string;
}

export class UpdateTicketStatusDto {
	@IsString()
	@IsNotEmpty()
	@IsIn(TICKET_STATUSES as unknown as string[])
	status!: string;
}
