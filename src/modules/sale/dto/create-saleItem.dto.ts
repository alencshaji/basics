import { IsNumber, IsOptional, IsString, isString } from "class-validator";


export class CreateSaleItemDto {

    @IsOptional()
    @IsString()
    _id:string

    @IsString()
    saleId: string;

    @IsString()
    stockId: string;


    @IsNumber()
    @IsOptional()
    sgst: number;

    @IsNumber()
    @IsOptional()
    cgst: number;


    @IsNumber()
    @IsOptional()
    igst: number;


    @IsString()
    @IsOptional()
    hsn: string;

    @IsNumber()
    quantity: number;


    @IsNumber()
    rate: number;

    @IsNumber()
    unitRate: number;

    @IsNumber()
    total: number;


}