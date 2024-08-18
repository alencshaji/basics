import { IsNumber, IsOptional, IsString } from "class-validator";


export class SaleReturnItemDto{

    @IsString()
    saleItemId:string

    @IsString()
    itemMasterId: string;


    @IsNumber()
    @IsOptional()
    sgst: number;

    @IsNumber()
    @IsOptional()
    sgstValue: number;



    @IsNumber()
    @IsOptional()
    cgstValue: number;


    @IsNumber()
    @IsOptional()
    cgst: number;


    @IsNumber()
    @IsOptional()
    igst: number;


    @IsNumber()
    @IsOptional()
    igstValue: number;


    @IsString()
    @IsOptional()
    stockId: string;

    @IsNumber()
    quantity: number;

    @IsNumber()
    totalQuantity: number;

    @IsNumber()
    rate: number;

    @IsNumber()
    unitRate: number;

    @IsNumber()
    total: number;


}