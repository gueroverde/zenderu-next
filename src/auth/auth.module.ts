import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
// App Modules
import { UserModule } from 'src/user/user.module';
import { MailsModule } from 'src/mails/mails.module';
import { LoggerModule } from 'src/logger/logger.module';
// Env Config
import { ConfigService, ConfigModule } from '@nestjs/config';
// Guards 
import { GqlAuthGuard } from './guards/gql-auth.guard';
// Schemas
import { User, UserSchema } from 'src/user/models/user.model';
import { ForgotPassword, ForgotPasswordSchema } from './models/forgot-password.model';
import { RefreshToken, RefreshTokenSchema } from './models/refresh-token.model';
//Scalars
import { DateScalar } from 'src/scalars/date.scalar';
import { ObjectIdScalar } from 'src/scalars/object-id.scalar';

@Module({
  imports: [
    LoggerModule,
    MailsModule,
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
    MongooseModule.forFeature([{ name: ForgotPassword.name, schema: ForgotPasswordSchema}]),
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema}]),
  ],
  providers: [AuthService, JwtStrategy, AuthResolver, GqlAuthGuard, DateScalar, ObjectIdScalar],
  exports: [AuthService, GqlAuthGuard]
})
export class AuthModule {}
