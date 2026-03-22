import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
} from "class-validator";

export class CreateSubscriptionDto {
	@IsInt()
	@IsNotEmpty()
	customerId: number;

	@IsString()
	@IsNotEmpty()
	type: string; // STF, KG, KG + STF, Land, landscape

	@IsString()
	@IsNotEmpty()
	package: string;

	@IsNumber()
	@IsOptional()
	actualPrice?: number;

	@IsNumber()
	@IsNotEmpty()
	offerPrice: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsNumber()
	@IsOptional()
	totalQuantity?: number;

	@IsNumber()
	@IsOptional()
	deliveredQty?: number;

	@IsInt()
	@IsOptional()
	totalDeliveries?: number;

	@IsInt()
	@IsOptional()
	deliveredBasket?: number;

	@IsNumber()
	@IsOptional()
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
	status?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}

export class UpdateSubscriptionDto {
	@IsString()
	@IsOptional()
	type?: string;

	@IsString()
	@IsOptional()
	package?: string;

	@IsNumber()
	@IsOptional()
	actualPrice?: number;

	@IsNumber()
	@IsOptional()
	offerPrice?: number;

	@IsString()
	@IsOptional()
	paymentTerms?: string;

	@IsNumber()
	@IsOptional()
	totalQuantity?: number;

	@IsNumber()
	@IsOptional()
	deliveredQty?: number;

	@IsInt()
	@IsOptional()
	totalDeliveries?: number;

	@IsInt()
	@IsOptional()
	deliveredBasket?: number;

	@IsNumber()
	@IsOptional()
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
	status?: string;

	@IsString()
	@IsOptional()
	remarks?: string;
}
