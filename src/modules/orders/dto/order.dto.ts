import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
	IsArray,
} from "class-validator";

export class CreateOrderDto {
	@IsInt()
	@IsNotEmpty()
	customerId: number;

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
	@IsInt()
	@IsOptional()
	customerId?: number;

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
