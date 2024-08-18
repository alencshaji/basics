import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePurchaseReturnItemDto{

    @IsString()
    @IsOptional()
    purchaseReturnId: string;

    @IsString()
    purchaseItemId: string;

    @IsString()
    @IsOptional()
    packId: string;

    @IsNumber()
    @IsOptional()
    packQuantity: number;

    @IsString()
    itemMasterId: string;

    @IsString()
    @IsOptional()   
    itemMasterName: string;


    @IsNumber()
    @IsOptional()
    sgst: number;

    @IsNumber()
    @IsOptional()
    sgstValue: number;

    @IsNumber()
    @IsOptional()
    cgst: number;

    @IsNumber()
    @IsOptional()
    cgstValue: number;

    @IsNumber()
    @IsOptional()
    igst: number;

    @IsNumber()
    @IsOptional()
    igstValue: number;

    @IsString()
    stockId: string;

    @IsNumber()
    purchaseQuantity: number;

    @IsNumber()
    @IsOptional()
    purchaseUnitRate:number

    @IsNumber()
    totalQuantity: number;

    @IsNumber()
    @IsOptional()
    freeQuantity: number;

    @IsNumber()
    @IsOptional()
    returnQty: number;

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