import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsDateString,
	IsArray,
} from "class-validator";

export class CreateOrderDto {
	@IsString()
	@IsNotEmpty()
	customerId: string;

	@IsArray()
	@IsNotEmpty()
	items: any[]; // [{name, qty, unit, price}]

	@IsNumber()
	@IsNotEmpty()
	totalAmount: number;

	@IsString()
	@IsOptional()
	status?: string;

	@IsDateString()
	@IsNotEmpty()
	deliveryDate: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateOrderDto {
	@IsString()
	@IsOptional()
	customerId?: string;

	@IsArray()
	@IsOptional()
	items?: any[];

	@IsNumber()
	@IsOptional()
	totalAmount?: number;

	@IsString()
	@IsOptional()
	status?: string;

	@IsDateString()
	@IsOptional()
	deliveryDate?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}
