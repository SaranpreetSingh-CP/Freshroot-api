import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
	IsIn,
	IsArray,
	ValidateNested,
	ValidateIf,
} from "class-validator";
import { Type, Transform } from "class-transformer";

// ─── Nested Plan DTOs ───────────────────────────────────────────

export class VegetableLimitDto {
	@IsInt()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	vegetableId!: number;

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
}

export class CreatePlanDto {
	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQty!: number;

	@IsString()
	@IsOptional()
	label?: string;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => VegetableLimitDto)
	limits?: VegetableLimitDto[];
}

export class UpdatePlanDto {
	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQty?: number;

	@IsString()
	@IsOptional()
	label?: string;

	@IsArray()
	@IsOptional()
	@ValidateNested({ each: true })
	@Type(() => VegetableLimitDto)
	limits?: VegetableLimitDto[];
}

// ─── Nested Subscription DTOs ───────────────────────────────────

export class NestedCreateSubscriptionDto {
	@IsString()
	@IsNotEmpty()
	type!: string; // STF, KG, KG + STF, Land, landscape

	@IsString()
	@IsNotEmpty()
	package!: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	actualPrice?: number;

	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	offerPrice!: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQuantity?: number;

	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	totalDeliveries?: number;

	@IsDateString()
	@IsOptional()
	startDate?: string;

	@IsDateString()
	@IsOptional()
	endDate?: string;

	@IsString()
	@IsOptional()
	@IsIn(["active", "inactive", "paused", "expired", "cancelled"])
	status?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

export class NestedUpdateSubscriptionDto {
	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	id?: number;

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

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	totalQuantity?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	deliveredQty?: number;

	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	totalDeliveries?: number;

	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	deliveredBasket?: number;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseFloat(value) : value,
	)
	pendingKgs?: number;

	@IsDateString()
	@IsOptional()
	startDate?: string;

	@IsDateString()
	@IsOptional()
	endDate?: string;

	@IsDateString()
	@IsOptional()
	nextRenewal?: string;

	@IsString()
	@IsOptional()
	@IsIn(["active", "inactive", "paused", "expired", "cancelled"])
	status?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

// ─── Customer DTOs ──────────────────────────────────────────────

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

	@IsOptional()
	@ValidateNested()
	@Type(() => NestedCreateSubscriptionDto)
	subscription?: NestedCreateSubscriptionDto;

	@IsOptional()
	@ValidateNested()
	@Type(() => CreatePlanDto)
	plan?: CreatePlanDto;
}

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

	@IsOptional()
	@ValidateNested()
	@Type(() => NestedUpdateSubscriptionDto)
	subscription?: NestedUpdateSubscriptionDto;

	@IsOptional()
	@ValidateNested()
	@Type(() => UpdatePlanDto)
	plan?: UpdatePlanDto;
}
