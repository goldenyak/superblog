import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './exeption-filters/exeption.filter';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	app.enableCors();
	// app.setGlobalPrefix('api');
	app.useGlobalPipes(
		new ValidationPipe({
			stopAtFirstError: true,
			exceptionFactory: (errors) => {
				const errorsForResponse = [];
				errors.forEach((e) => {
					const constraintsKeys = Object.keys(e.constraints);
					constraintsKeys.forEach((key) => {
						errorsForResponse.push({ message: e.constraints[key], field: e.property });
					});
				});
				throw new BadRequestException(errorsForResponse);
			},
		}),
	);
	app.useGlobalFilters(new HttpExceptionFilter());
	app.use(cookieParser());
	app.set('trust proxy', 1);
	await app.listen(process.env.PORT || 3000);
}
bootstrap();
