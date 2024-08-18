import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { vendorSchema } from 'src/schemas/vendor.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Vendor', schema: vendorSchema }
  ])],
  controllers: [VendorController],
  providers: [VendorService,JwtService]
})
export class VendorModule {}
