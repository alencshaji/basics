import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigurationModule } from './modules/common/services/configuration.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
 
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    AuthModule, 
    UserModule,
    ConfigurationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
