import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
	IsArray,
	ValidateNested,
	IsIn,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export const ORDER_STATUSES = [
	"PENDING",
	"CONFIRMED",
	"PROCESSING",
	"DELIVERED",
	"CANCELLED",
] as const;

/** Normalize legacy lowercase / mixed-case status to uppercase */
export function normalizeOrderStatus(raw?: string): string | undefined {
	if (!raw) return undefined;
	const upper = raw.toUpperCase();
	const map: Record<string, string> = {
		PENDING: "PENDING",
		CONFIRMED: "CONFIRMED",
		PROCESSING: "PROCESSING",
		DELIVERED: "DELIVERED",
		CANCELLED: "CANCELLED",
		// legacy lowercase aliases
		DISPATCHED: "PROCESSING",
	};
	return map[upper] ?? upper;
}

export class OrderItemDto {
	/** Preferred: reference a vegetable by id */
	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	vegetableId?: number;

	/** Accept name directly */
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	itemName?: string;

	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	quantity!: number;

	@IsString()
	@IsIn(["kg", "piece"])
	unit!: string;
}

export class CreateOrderDto {
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	@IsInt()
	@IsNotEmpty()
	customerId!: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items!: OrderItemDto[];

	/** Accept both "total" and "totalAmount" */
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	total?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalAmount?: number;

	@IsString()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.toUpperCase() : value,
	)
	@IsIn(ORDER_STATUSES as unknown as string[])
	status?: string;

	@IsDateString()
	@IsOptional()
	deliveryDate?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateOrderDto {
	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	customerId?: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	@IsOptional()
	items?: OrderItemDto[];

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	total?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalAmount?: number;

	@IsString()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? value.toUpperCase() : value,
	)
	@IsIn(ORDER_STATUSES as unknown as string[])
	status?: string;

	@IsDateString()
	@IsOptional()
	deliveryDate?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateOrderStatusDto {
	@IsString()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? value.toUpperCase() : value,
	)
	@IsIn(ORDER_STATUSES as unknown as string[])
	status!: string;
}
