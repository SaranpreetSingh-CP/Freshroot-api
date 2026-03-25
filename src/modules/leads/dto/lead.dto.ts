import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsEmail,
	IsIn,
} from "class-validator";

export class CreateLeadDto {
	@IsString()
	@IsNotEmpty()
	name!: string;

	@IsString()
	@IsNotEmpty()
	phone!: string;

	@IsEmail()
	@IsOptional()
	email?: string;

	@IsString()
	@IsOptional()
	areaSize?: string; // e.g. "200 sq ft"

	@IsString()
	@IsOptional()
	planType?: string; // grow bag / land area

	@IsString()
	@IsOptional()
	message?: string;
}

export class UpdateLeadStatusDto {
	@IsString()
	@IsIn(["NEW", "CONTACTED", "CONVERTED"])
	status!: string;
}
