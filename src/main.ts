import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableCors();
	// app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());
	app.use(cookieParser());
	app.set('trust proxy', 1);
	await app.listen(process.env.PORT || 3000);
}
bootstrap();
