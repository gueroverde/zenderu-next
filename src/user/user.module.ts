import { Module, forwardRef } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
//Models
import { User, UserSchema } from './models/user.model';
//Scalars
import { DateScalar } from 'src/scalars/date.scalar';
import { ObjectIdScalar } from 'src/scalars/object-id.scalar';
//App Modules
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => NotificationModule),
    LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserResolver, UserService, DateScalar, ObjectIdScalar],
  exports: [UserService],
})
export class UserModule {}