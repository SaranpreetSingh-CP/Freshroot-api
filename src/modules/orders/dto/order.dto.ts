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

export class OrderItemDto {
	/** Preferred: reference a vegetable by id */
	@IsInt()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	vegetableId?: number;

	/** Legacy: accept name directly */
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	itemName?: string;

	@IsNumber()
	@IsNotEmpty()
	quantity: number;

	@IsString()
	@IsIn(["kg", "piece"])
	unit: string;
}

export class CreateOrderDto {
	@Transform(({ value }) =>
		typeof value === "string" ? parseInt(value, 10) : value,
	)
	@IsInt()
	@IsNotEmpty()
	customerId: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OrderItemDto)
	items: OrderItemDto[];

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
