import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
	IsIn,
} from "class-validator";

export const DELIVERY_STATUSES = [
	"NOT_STARTED",
	"IN_TRANSIT",
	"OUT_FOR_DELIVERY",
	"DELIVERED",
] as const;

export class CreateDeliveryDto {
	@IsInt()
	@IsNotEmpty()
	subscriptionId: number;

	@IsNumber()
	@IsNotEmpty()
	deliveredQty: number;

	@IsDateString()
	@IsNotEmpty()
	date: string;

	@IsString()
	@IsOptional()
	@IsIn(DELIVERY_STATUSES)
	status?: string;

	@IsString()
	@IsOptional()
	driverName?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateDeliveryDto {
	@IsNumber()
	@IsOptional()
	deliveredQty?: number;

	@IsDateString()
	@IsOptional()
	date?: string;

	@IsString()
	@IsOptional()
	@IsIn(DELIVERY_STATUSES)
	status?: string;

	@IsString()
	@IsOptional()
	driverName?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateDeliveryStatusDto {
	@IsString()
	@IsNotEmpty()
	@IsIn(DELIVERY_STATUSES)
	status: string;
}
