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
import { Type } from "class-transformer";

export class OrderItemDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsNumber()
	@IsNotEmpty()
	quantity: number;

	@IsString()
	@IsIn(["kg", "piece"])
	unit: string;
}

export class CreateOrderDto {
	@IsInt()
	@IsNotEmpty()
	customerId: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[];

	@IsNumber()
	@IsNotEmpty()
	totalAmount: number;

	@IsString()
	@IsOptional()
	@IsIn(["pending", "processing", "delivered"])
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
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	@IsOptional()
	items?: OrderItemDto[];

	@IsNumber()
	@IsOptional()
	totalAmount?: number;

	@IsString()
	@IsOptional()
	@IsIn(["pending", "processing", "delivered"])
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
	@IsIn(["pending", "processing", "delivered"])
	status: string;
}
