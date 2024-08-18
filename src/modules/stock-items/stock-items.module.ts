import { Module } from '@nestjs/common';
import { StockItemsService } from './stock-items.service';
import { StockItemsController } from './stock-items.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StockItemSchema } from 'src/schemas/stockItem.schema';
import { StockLocation, StockLocationSchema } from 'src/schemas/stockLocation.schema';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { StockStatusUpdate } from './cron-job.stock';
import { PurchaseSchema } from 'src/schemas/purchase.schema';
import { SaleSchema } from 'src/schemas/sale.schema';
import { purchaseItemSchema } from 'src/schemas/purchaseItem.schema';
import {  ItemMasterSchema } from 'src/schemas/item-master.schema';
import { StockItemHistorySchema } from 'src/schemas/stockItemHistory.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'StockItem', schema:StockItemSchema },
    { name: 'StockLocation', schema:StockLocationSchema },
    { name: 'ItemMaster', schema:ItemMasterSchema },
    {name:'StockItemHistory',schema:StockItemHistorySchema}
  ]),],
  controllers: [StockItemsController],
  providers: [StockItemsService,JwtModule,StockStatusUpdate]
})
export class StockItemsModule {}
