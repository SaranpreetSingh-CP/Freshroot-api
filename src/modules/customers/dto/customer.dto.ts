import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	phone: string;

	@IsEmail()
	@IsOptional()
	email?: string;
}

export class UpdateCustomerDto {
	@IsString()
	@IsOptional()
	name?: string;

	@IsString()
	@IsOptional()
	phone?: string;

	@IsEmail()
	@IsOptional()
	email?: string;
}
