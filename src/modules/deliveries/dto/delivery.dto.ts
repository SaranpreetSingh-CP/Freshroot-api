import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
} from "class-validator";

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
	status?: string;

	@IsString()
	@IsOptional()
	driverName?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}
