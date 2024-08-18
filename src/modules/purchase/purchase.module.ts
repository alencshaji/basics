import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ManufacturerSchema } from 'src/schemas/manufacturer.schema';
import { PurchaseSchema } from 'src/schemas/purchase.schema';
import { purchaseItemSchema } from 'src/schemas/purchaseItem.schema';
import { JwtModule } from '@nestjs/jwt';
import { StockItemSchema } from 'src/schemas/stockItem.schema';
import { vendorSchema } from 'src/schemas/vendor.schema';
import { ItemMasterSchema } from 'src/schemas/item-master.schema';
import { packSchema } from 'src/schemas/pack.schema';
import { purchaseReturnSchema } from 'src/schemas/purchaseReturn.schema';
import { purchaseReturnItemSchema } from 'src/schemas/purchaseReturnItem.schema';
import { IdModule } from '../common/services/id.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Purchase', schema: PurchaseSchema },
    { name: 'PurchaseItem', schema: purchaseItemSchema },
    { name: 'PurchaseReturn', schema: purchaseReturnSchema},
    { name: 'PurchaseReturnItem', schema: purchaseReturnItemSchema },
    { name: 'ItemMaster', schema: ItemMasterSchema },
    { name: 'Manufacturer', schema: ManufacturerSchema },
    { name: 'StockItem', schema: StockItemSchema },
    { name: 'Vendor', schema: vendorSchema },
    { name: 'Pack', schema:packSchema },
  ]),
    IdModule],
  controllers: [PurchaseController],
  providers: [PurchaseService, JwtModule]
})
export class PurchaseModule { }
