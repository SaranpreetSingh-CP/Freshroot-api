import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	phone: string;

	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsNotEmpty()
	address: string;
}

export class UpdateCustomerDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsString()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	address?: string;
}
