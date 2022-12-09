import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {
  }
  async sendConfirmEmail(email: string, confirmationCode: string) {
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

  async sendNewConfirmEmail(email: string, newCode: string) {
    return await this.mailService
      .sendMail({
        to: email,
        subject: 'Email confirmation code',
        text: 'welcome',
        // html: `<a href=\'https://superblog-eight.vercel.app/auth/registration-confirmation?code=${user.confirmationCode}\'>confirm your email</a>`,
        html: `<a href='https://somesite.com/confirm-email?code=${newCode}'>confirm your email</a>`,
        context: {
          newCode
        },
      })
      .catch((e) => {
        throw new HttpException(
          `Ошибка работы почты! Потому что что? Потому что ты ввел какую-то хуйню!`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      });
  }

  async sendRecoveryPasswordEmail(email: string, recoveryCode: string) {
    return await this.mailService
      .sendMail({
        to: email,
        subject: 'Email recovery code',
        text: 'welcome',
        html: `<a href=\'https://superblog-eight.vercel.app/auth/password-recovery?recoveryCode=${recoveryCode}\'>recovery password</a>`,
      })
      .catch(() => {
        throw new HttpException(
          `Ошибка работы почты! Потому что что? Потому что ты ввел какую-то хуйню!`,
          HttpStatus.BAD_REQUEST,
        );
      });
  }
}
