import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config';
//Logger
import { Logger } from '../logger/logger.service';

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private logger: Logger) {
      this.logger.setContextNest('MailsService');
    }

  public async sendVerifyMail(email, token): Promise<any> {
    this.logger.log(`Sending verification email to: ${email}`)
    return this.mailerService.sendMail({
      to: email,
      from: this.configService.get('SMTP_USERNAME'), // sender address
      subject: 'Verify Email', // Subject line
      text: 'Verify Email', // plaintext body
      html: 'Hi! <br><br> Thanks for your registration<br><br>' +
        '<a href=' + 'https:localhost' + ':' + '3000' + '/auth/email/verify/' + token + '>Click here to activate your account</a>'  // html body
    })
  }
}
