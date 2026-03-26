import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
	IsIn,
	IsArray,
	IsBoolean,
	ValidateNested,
} from "class-validator";
import { Type, Transform } from "class-transformer";

// ─── Nested Subscription (frontend format) ─────────────────────

export class SubscriptionDto {
	@IsString()
	@IsOptional()
	type?: string;

	@IsString()
	@IsOptional()
	package?: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	actualPrice?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	offerPrice?: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsDateString()
	@IsOptional()
	startDate?: string;

	@IsString()
	@IsOptional()
	status?: string;
}

// ─── Nested Plan (frontend format) ──────────────────────────────

export class PlanDto {
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQty?: number;
}

// ─── Vegetable Limit (flat) ─────────────────────────────────────

export class VegetableLimitDto {
	@IsInt()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	vegetableId!: number;

	@IsString()
	@IsOptional()
	@IsIn(["kg", "piece"])
	unit?: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	maxQty?: number;

	// Legacy support
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	maxQtyKg?: number;

	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	maxQtyPiece?: number;

	// Frontend sends limitQty instead of maxQty
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	limitQty?: number;
}

// ─── Create Customer DTO (flat payload) ─────────────────────────

export class CreateCustomerDto {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsString()
	@IsNotEmpty()
	phone!: string;

	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsNotEmpty()
	address!: string;

	@IsString()
	@IsOptional()
	@IsIn(["active", "inactive"])
	status?: string;

	// ── Subscription fields ─────────────────────────────────
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === "string") return value === "true";
		return value;
	})
	hasSubscription?: boolean;

	@IsString()
	@IsOptional()
	planType?: string;

	@IsString()
	@IsOptional()
	packageName?: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	actualPrice?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	offerPrice?: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsDateString()
	@IsOptional()
	startDate?: string;

	// ── Nested subscription (frontend format) ──────────────
	@IsOptional()
	@ValidateNested()
	@Type(() => SubscriptionDto)
	subscription?: SubscriptionDto;

	// ── Nested plan (frontend format) ──────────────────────
	@IsOptional()
	@ValidateNested()
	@Type(() => PlanDto)
	plan?: PlanDto;

	// ── Plan limit fields ───────────────────────────────────
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQtyKg?: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => VegetableLimitDto)
	vegetableLimits?: VegetableLimitDto[];
}

// ─── Update Customer DTO (flat payload, all optional) ───────────

export class UpdateCustomerDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	address?: string;

	@IsString()
	@IsOptional()
	@IsIn(["active", "inactive"])
	status?: string;

	// ── Subscription fields ─────────────────────────────────
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === "string") return value === "true";
		return value;
	})
	hasSubscription?: boolean;

	@IsString()
	@IsOptional()
	planType?: string;

	@IsString()
	@IsOptional()
	packageName?: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	actualPrice?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	offerPrice?: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsDateString()
	@IsOptional()
	startDate?: string;

	// ── Nested subscription (frontend format) ──────────────
	@IsOptional()
	@ValidateNested()
	@Type(() => SubscriptionDto)
	subscription?: SubscriptionDto;

	// ── Nested plan (frontend format) ──────────────────────
	@IsOptional()
	@ValidateNested()
	@Type(() => PlanDto)
	plan?: PlanDto;

	// ── Plan limit fields ───────────────────────────────────
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQtyKg?: number;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => VegetableLimitDto)
	vegetableLimits?: VegetableLimitDto[];
}
