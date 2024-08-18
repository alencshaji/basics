import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { PaymentMode, PaymentStatus } from "src/schemas/purchase.schema";
import { SaleReturnItemDto } from "./create-saleReturnItem.dto";
import { Type } from "class-transformer";

export class SaleReturnDto{

    @IsString()
    saleId:string;

    @IsString()
    saleCode:string;

    @IsString()
    @IsOptional()
    patientCode:string

    @IsString()
    @IsOptional()
    patientName:string

    @IsString()
    @IsOptional()
    patientPhone:string;

    @IsString()
    @IsOptional()
    patientState:string;

    @IsString()
    @IsOptional()
    doctorName:string;

    @IsString()
    @IsOptional()
    doctorPhone:string;

    @IsString()
    @IsOptional()
    reason:string;

    @IsNumber()
    @IsOptional()
    grossTotal:number;

    @IsNumber()
    @IsOptional()
    totalCgst:number;

    @IsNumber()
    @IsOptional()
    totalSgst:number;

    @IsNumber()
    @IsOptional()
    totalIgst:number;

    @IsNumber()
    @IsOptional()
    grandTotal:number;

    @IsEnum(PaymentMode)
    @IsString()
    paymentMode:PaymentMode;

    @IsEnum(PaymentStatus)
    @IsString()
    paymentStatus:PaymentStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SaleReturnItemDto)
    saleReturnItemDetails: SaleReturnItemDto[];
}