import {
	Controller,
	Post,
	Get,
	Body,
	Req,
	HttpCode,
	HttpStatus,
	UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/index.js";
import { JwtAuthGuard } from "./guards/index.js";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	async me(@Req() req: any) {
		const payload = req.user;
		return this.authService.getProfile(payload.sub);
	}
}
