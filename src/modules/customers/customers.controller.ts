import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	UseGuards,
} from "@nestjs/common";
import { CustomersService } from "./customers.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";
import { JwtAuthGuard } from "../auth/guards/index.js";

@Controller("customers")
@UseGuards(JwtAuthGuard)
export class CustomersController {
	constructor(private readonly customersService: CustomersService) {}

	@Post()
	create(@Body() dto: CreateCustomerDto) {
		return this.customersService.create(dto);
	}

	@Get()
	findAll() {
		return this.customersService.findAll();
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.customersService.findOne(id);
	}

	@Put(":id")
	update(@Param("id") id: string, @Body() dto: UpdateCustomerDto) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.customersService.remove(id);
	}
}
