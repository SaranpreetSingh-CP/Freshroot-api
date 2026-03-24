import { Type } from "class-transformer";
import {
	IsArray,
	IsDateString,
	IsNumber,
	Min,
	ValidateNested,
} from "class-validator";

export class PriceItemDto {
	@IsNumber()
	vegetableId: number;

	@IsNumber()
	@Min(0)
	price: number;
}

export class CreateVegetablePricesDto {
	@IsDateString()
	date: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => PriceItemDto)
	prices: PriceItemDto[];
}
