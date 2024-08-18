import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleSchema } from 'src/schemas/sale.schema';
import { StockItemSchema } from 'src/schemas/stockItem.schema';
import { ItemMasterSchema } from 'src/schemas/item-master.schema';
import { SaleItem, SaleItemSchema } from 'src/schemas/saleItem.schema';
import { SaleReturn, SaleReturnSchema } from 'src/schemas/saleReturn.schema';
import { SaleReturnItem, SaleReturnItemSchema } from 'src/schemas/saleReturnItem.schema';
import { ManufacturerSchema } from 'src/schemas/manufacturer.schema';
import { IdModule } from '../common/services/id.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Sale', schema: SaleSchema },
    { name: 'SaleItem', schema: SaleItemSchema },
    { name: 'StockItem', schema: StockItemSchema },
    { name: 'ItemMaster', schema: ItemMasterSchema },
    { name: 'SaleReturn', schema: SaleReturnSchema },
    { name: 'SaleReturnItem', schema: SaleReturnItemSchema },
    { name: 'Manufacturer', schema: ManufacturerSchema },
  ],),IdModule],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService]
})
export class SaleModule { }
