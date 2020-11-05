import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailsService } from './mails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { LoggerModule } from 'src/logger/logger.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    LoggerModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: `smtp://${configService.get('SMTP_USERNAME')}:${configService.get('SMTP_PASSWORD')}@${configService.get('SMTP_HOST')}`,
        defaults: {
          from: `${configService.get('SMTP_FROM_NAME')} <${configService.get('SMTP_USERNAME')}>`,
        },
        template: {
          dir: __dirname + '/mailTemplates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailsService, ConfigService],
  exports: [MailsService]
})
export class MailsModule { }
