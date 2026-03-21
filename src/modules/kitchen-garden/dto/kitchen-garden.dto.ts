import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsDateString,
	IsArray,
} from "class-validator";

export class CreateKitchenGardenDto {
	@IsString()
	@IsNotEmpty()
	customerId: string;

	@IsDateString()
	@IsNotEmpty()
	setupDate: string;

	@IsString()
	@IsOptional()
	location?: string;

	@IsString()
	@IsOptional()
	gardenSize?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateKitchenGardenDto {
	@IsDateString()
	@IsOptional()
	setupDate?: string;

	@IsString()
	@IsOptional()
	location?: string;

	@IsString()
	@IsOptional()
	gardenSize?: string;

	@IsString()
	@IsOptional()
	status?: string;

	@IsString()
	@IsOptional()
	notes?: string;
}

export class CreateKGVisitDto {
	@IsString()
	@IsNotEmpty()
	kitchenGardenId: string;

	@IsDateString()
	@IsNotEmpty()
	visitDate: string;

	@IsString()
	@IsNotEmpty()
	workDone: string;

	@IsString()
	@IsOptional()
	healthStatus?: string;

	@IsArray()
	@IsOptional()
	photos?: string[];

	@IsString()
	@IsOptional()
	notes?: string;
}

export class UpdateKGVisitDto {
	@IsDateString()
	@IsOptional()
	visitDate?: string;

	@IsString()
	@IsOptional()
	workDone?: string;

	@IsString()
	@IsOptional()
	healthStatus?: string;

	@IsArray()
	@IsOptional()
	photos?: string[];

	@IsString()
	@IsOptional()
	notes?: string;
}
