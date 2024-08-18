import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Services, ServicesSchema } from 'src/schemas/service.schema';
import { JwtService } from '@nestjs/jwt';
import { IdModule } from '../common/services/id.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name:Services.name, schema: ServicesSchema }
  ]),IdModule],
  controllers: [ServicesController],
  providers: [ServicesService,JwtService]
})
export class ServicesModule {}
