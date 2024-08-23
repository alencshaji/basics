import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigurationModule } from './modules/common/services/configuration.service';
import { VendorModule } from './modules/vendor/vendor.module';
import { StockItemsModule } from './modules/stock-items/stock-items.module';
import { ServicesModule } from './modules/services/services.module';
import { SaleModule } from './modules/sale/sale.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { PackModule } from './modules/pack/pack.module';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './modules/common/services/email.service';
import { IdService } from './modules/common/services/id.service';

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
    VendorModule,
    StockItemsModule,
    ServicesModule,
    ConfigurationModule,
    SaleModule,
    PurchaseModule,
    PackModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
