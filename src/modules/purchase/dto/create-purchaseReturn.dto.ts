import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreatePurchaseReturnItemDto } from "./create-purchaseReturnItem.dto";

export enum ReturnStatus {
    PROCESSED = 'processed',
    COMPLETED = 'completed'
}

export class CreatePurchaseReturnDto {

    @IsString()
    billDate: Date;

    @IsString()
    @IsOptional()
    purchaseId: string;


    @IsString()
    purchaseInvoiceNumber: string;

    @IsString()
    purchaseInvoiceDate: Date;

    @IsString()
    vendorId: string;

    @IsString()
    @IsOptional()
    reason: string;

    @IsNumber()
    @IsOptional()
    grossTotal: number;

    @IsNumber()
    @IsOptional()
    totalCgst: number;

    @IsNumber()
    @IsOptional()
    totalSgst: number;

    @IsNumber()
    @IsOptional()
    totalIgst: number;

    @IsNumber()
    @IsOptional()
    totalAmount: number;

    @IsNumber()
    @IsOptional()
    cess: number;

    @IsNumber()
    @IsOptional()
    others: number;

    @IsNumber()
    @IsOptional()
    grandTotal: number;

    @IsEnum(ReturnStatus)
    @IsString()
    @IsOptional()
    purchaseReturnStatus: ReturnStatus;

    @IsBoolean()
    isDraft: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePurchaseReturnItemDto)
    purchaseReturnItems: CreatePurchaseReturnItemDto[];
}