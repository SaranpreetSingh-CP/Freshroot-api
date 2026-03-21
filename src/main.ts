import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe, Logger } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const logger = new Logger("Bootstrap");

	// Global validation pipe for DTO validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Enable CORS
	app.enableCors();

	// Global prefix
	app.setGlobalPrefix("api");

	const port = process.env.PORT ?? 4000;
	await app.listen(port);
	logger.log(`🌱 Freshroot API running on http://localhost:${port}/api`);
}
bootstrap();
