import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsDateString,
} from "class-validator";

export class CreateDeliveryDto {
	@IsString()
	@IsNotEmpty()
	orderId: string;

	@IsString()
	@IsNotEmpty()
	addressId: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsDateString()
	@IsOptional()
	deliveredAt?: string;

	@IsString()
	@IsOptional()
	driverName?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateDeliveryDto {
	@IsString()
	@IsOptional()
	status?: string;

	@IsDateString()
	@IsOptional()
	deliveredAt?: string;

	@IsString()
	@IsOptional()
	driverName?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}
