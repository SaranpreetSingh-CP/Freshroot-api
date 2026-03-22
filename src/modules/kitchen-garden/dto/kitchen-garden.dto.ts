import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsInt,
	IsDateString,
	IsArray,
} from "class-validator";

export class CreateKitchenGardenDto {
	@IsInt()
	@IsNotEmpty()
	subscriptionId: number;

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
	maintenanceCycle?: string;

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
	maintenanceCycle?: string;

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
