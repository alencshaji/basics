import { IsDate, IsNumber, IsOptional, IsString } from "class-validator";


export class PurchaseItemDto {

    @IsString()
    purchaseId: string;

    @IsString()
    itemMasterId: string;

    @IsString()
    @IsOptional()   
    itemName: string;


    @IsNumber()
    @IsOptional()
    sgst: number;

    @IsNumber()
    @IsOptional()
    cgst: number;

    @IsNumber()
    @IsOptional()
    igst: number;

    @IsNumber()
    purchaseQuantity: number;

    @IsNumber()
    @IsOptional()
    freeQuantity: number;

    @IsNumber()
    purchaseRate: number;

    @IsNumber()
    mrp: number;

    @IsNumber()
    salePrice: number;


    @IsString()
    @IsOptional()
    batch: string;


    @IsOptional()
    @IsString()
    expiryDate: Date;

    @IsNumber()
    @IsOptional()
    unitRate: number;

    @IsNumber()
    @IsOptional()
    total: number;


}