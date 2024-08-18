import { PartialType } from '@nestjs/mapped-types';
import { CreateStockItemDto } from './create-stock-item.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStockItemDto extends PartialType(CreateStockItemDto) {

    @IsOptional()
    @IsString()
    locationId?:any;

    @IsOptional()
    @IsString()
    locationName?:string;

    @IsOptional()
    @IsString()
    boxNumber?:string;

    @IsOptional()
    @IsNumber()
    quantity?:number;

    @IsOptional()
    @IsString()
    filterName?:string;


}
