import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsString, ValidateNested, isString } from "class-validator";
import { PaymentMode, PaymentStatus } from "src/schemas/purchase.schema";

export class CreatePurchaseDto {

    @IsString()
    @IsOptional()
    purchaseId: string;

    @IsString()
    @IsOptional()
    vendorId: string;

    @IsString()
    invoiceNumber: string;
  
    @IsString()
    invoiceDate: Date;

    @IsString()
    billDate: Date;

    @IsBoolean()
    isDraft: boolean;

}
