import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsDateString,
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
}

export class UpdateExpenseDto {
	@IsString()
	@IsOptional()
	category?: string;

	@IsString()
	@IsOptional()
	description?: string;

	@IsNumber()
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
}
