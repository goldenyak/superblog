import { Module } from '@nestjs/common';
import { MailerModule, MailerService } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { getMailConfig } from "../configs/mail.config";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";


@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getMailConfig,
			inject: [ConfigService],
		}),
	],
	providers: [EmailService],
  exports: [EmailService]
})
export class EmailModule {}
