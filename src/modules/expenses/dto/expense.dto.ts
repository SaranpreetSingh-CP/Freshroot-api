import { Transform } from "class-transformer";
import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsDateString,
	Min,
} from "class-validator";

export class CreateExpenseDto {
	@IsString()
	@IsNotEmpty()
	category: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsNumber()
	@IsNotEmpty()
	amount: number;

	@IsDateString()
	@IsNotEmpty()
	date: string;

	@IsString()
	@IsOptional()
	paidTo?: string;

	@IsString()
	@IsOptional()
	receipt?: string;

	@IsString()
	@IsOptional()
	billUrl?: string;
}

export class UpdateExpenseDto {
	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@Transform(({ value }) => (value != null ? Number(value) : undefined))
	@IsNumber()
	@Min(0, { message: "amount must be greater than 0" })
	@IsOptional()
	amount?: number;

	@IsDateString()
	@IsOptional()
	date?: string;

	@IsString()
	@IsOptional()
	paidTo?: string;

	@IsString()
	@IsOptional()
	receipt?: string;

	@IsString()
	@IsOptional()
	billUrl?: string;
}
