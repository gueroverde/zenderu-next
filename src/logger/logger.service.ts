import { LoggerService, Injectable, Logger as NestLogger} from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import 'dotenv/config';

@Injectable()
export class Logger implements LoggerService {
  private logger: winston.Logger;
  private nestLogger: NestLogger = new NestLogger('');
  constructor() {
    this.initializeLogger();
  }
  initializeLogger() {
    this.logger = winston.createLogger({
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/'),
          filename: 'debug.log',
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/'),
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/'),
          filename: 'info.log',
          level: 'info',
        }),
      ],
    });
  }

  setContextNest(context: string) {
    this.nestLogger.setContext(context)
  }

  error(message: string, trace: string) {
    this.nestLogger.error(`ERROR::${message}`)
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.nestLogger.log(`WARN::${message}`)
    this.logger.log('warn', message);
  }

  log(message: string) {
    this.nestLogger.log(`INFO::${message}`)
    this.logger.log('info', message);
  }
}
