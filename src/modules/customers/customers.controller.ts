import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	ParseIntPipe,
} from "@nestjs/common";
import { CustomersService } from "./customers.service.js";
import { CreateCustomerDto, UpdateCustomerDto } from "./dto/index.js";

@Controller("customers")
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
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.findOne(id);
	}

	@Patch(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateCustomerDto,
	) {
		return this.customersService.update(id, dto);
	}

	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.customersService.remove(id);
	}
}
