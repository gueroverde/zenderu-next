import { Module, forwardRef } from '@nestjs/common';
import { NotificationResolver } from './notification.resolver';
import { NotificationService } from './notification.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './models/notification.model';
//App Modules
import { LoggerModule } from 'src/logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';
//Scalars
import { DateScalar } from 'src/scalars/date.scalar';
import { ObjectIdScalar } from 'src/scalars/object-id.scalar';

@Module({
  imports: [
    LoggerModule,
    AuthModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  providers: [NotificationResolver, NotificationService, DateScalar, ObjectIdScalar],
  exports: [NotificationService],
})
export class NotificationModule {}
