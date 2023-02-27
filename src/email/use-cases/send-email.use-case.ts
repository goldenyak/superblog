import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { MailerService } from "@nestjs-modules/mailer";
import { HttpException, HttpStatus } from "@nestjs/common";

export class SendEmailCommand {
  constructor(public email: string, public confirmationCode: string) {}
}

@CommandHandler(SendEmailCommand)
export class SendEmailUseCase implements ICommandHandler<SendEmailCommand> {
  constructor(
    private readonly mailService: MailerService,
  ) {}

  async execute(command: SendEmailCommand) {
		const { email, confirmationCode } = command;
		return await this.mailService
		  .sendMail({
		    to: email,
		    subject: 'Email confirmation code',
		    text: 'welcome',
		    // html: `<a href=\'https://superblog-eight.vercel.app/auth/registration-confirmation?code=${user.confirmationCode}\'>confirm your email</a>`,
		    html: `<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>confirm your email</a>`,
		    context: {
		      confirmationCode
		    },
		  })
		  .catch((e) => {
		    throw new HttpException(
		      `Ошибка работы почты! Потому что что? Потому что ты ввел какую-то хуйню!`,
		      HttpStatus.UNPROCESSABLE_ENTITY,
		    );
		  });
	}
}