import 'dotenv/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

// App Modules
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';

//Scalars
import { DateScalar } from 'src/scalars/date.scalar';
import { ObjectIdScalar } from 'src/scalars/object-id.scalar';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb+srv://${configService.get('DB_USER')}:${configService.get('DB_PASSWORD')}@${configService.get('DB_HOST')}/${configService.get('DB_NAME')}?retryWrites=true&w=majority`,
        useNewUrlParser: true,
        connectionFactory: (connection) => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-autopopulate'));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot({
      debug: process.env.DEBUG === 'true' || false,
      playground: process.env.PLAYGROUND === 'true' || true,
      typePaths: ['./**/*.graphql'],
      installSubscriptionHandlers: true,
    }),
    ConfigModule.forRoot(),
    AuthModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, DateScalar, ObjectIdScalar],
})
export class AppModule {}
