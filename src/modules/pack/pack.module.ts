import { Module } from '@nestjs/common';
import { PackService } from './pack.service';
import { PackController } from './pack.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Pack, packSchema } from 'src/schemas/pack.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MongooseModule.forFeature([
    { name:Pack.name, schema:packSchema }
  ])],
  controllers: [PackController],
  providers: [PackService,JwtService]
})
export class PackModule {}
