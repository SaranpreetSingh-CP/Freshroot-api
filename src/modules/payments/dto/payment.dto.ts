import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsNumber,
	IsInt,
	IsDateString,
} from "class-validator";

export class CreatePaymentDto {
	@IsInt()
	@IsNotEmpty()
	customerId: number;

	@IsNumber()
	@IsNotEmpty()
	amount: number;

	@IsString()
	@IsOptional()
	method?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsString()
	@IsOptional()
	reference?: string;

	@IsDateString()
	@IsNotEmpty()
	date: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdatePaymentDto {
	@IsNumber()
	@IsOptional()
	amount?: number;

	@IsString()
	@IsOptional()
	method?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsString()
	@IsOptional()
	reference?: string;

	@IsDateString()
	@IsOptional()
	date?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}
