import {
	Injectable,
	NotFoundException,
	ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { CreateUserDto, UpdateUserDto } from "./dto/index.js";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateUserDto) {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});
		if (existing) {
			throw new ConflictException("User with this email already exists");
		}

		const hashedPassword = await bcrypt.hash(dto.password, 10);
		const user = await this.prisma.user.create({
			data: { ...dto, password: hashedPassword },
		});

		const { password: _, ...result } = user;
		return result;
	}

	async findAll() {
		const users = await this.prisma.user.findMany();
		return users.map(({ password: _, ...user }) => user);
	}

	async findOne(id: string) {
		const user = await this.prisma.user.findUnique({ where: { id } });
		if (!user) throw new NotFoundException("User not found");
		const { password: _, ...result } = user;
		return result;
	}

	async update(id: string, dto: UpdateUserDto) {
		await this.findOne(id);
		const data: any = { ...dto };
		if (dto.password) {
			data.password = await bcrypt.hash(dto.password, 10);
		}
		const user = await this.prisma.user.update({ where: { id }, data });
		const { password: _, ...result } = user;
		return result;
	}

	async remove(id: string) {
		await this.findOne(id);
		await this.prisma.user.delete({ where: { id } });
		return { message: "User deleted successfully" };
	}
}
