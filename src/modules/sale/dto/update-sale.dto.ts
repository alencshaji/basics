import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { PaymentMode, PaymentStatus } from 'src/schemas/purchase.schema';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {}

export class serviceDetails{

    @IsString()
    @IsOptional()
    serviceName: string;

    @IsString()
    @IsOptional()
    serviceId: string;

    @IsNumber()
    @IsOptional()
    serviceCost: number;


    @IsNumber()
    @IsOptional()
    quantity: number;

    @IsNumber()
    @IsOptional()
    serviceItemTotal: number;

    @IsNumber()
    @IsOptional()
    roundOff:number;

   

}
export class UpdateSaleDetailDto extends PartialType(CreateSaleDto) {
    
    @IsNumber()
    @IsOptional()
    grossTotal: Number;

    @IsNumber()
    @IsOptional()
    totalSgst: number;

    @IsNumber()
    @IsOptional()
    totalCgst: number;

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
    discount: number;

    @IsNumber()
    @IsOptional()
    grandTotal: number;


    @IsEnum(PaymentStatus)
    @IsString()
    @IsOptional()
    paymentStatus: PaymentStatus;

    @IsEnum(PaymentMode)
    @IsString()
    @IsOptional()
    paymentMode: PaymentMode;

    @IsBoolean()
    isDraft: boolean;

    @IsArray()
    @Type(() => serviceDetails)
    @IsOptional()
    serviceDetails: serviceDetails[];

    @IsOptional()
    @IsNumber()
    serviceTotal: number;

    @IsOptional()
    @IsNumber()
    serviceDiscount: number;

    @IsOptional()
    @IsNumber()
    serviceGrandTotal: number;

    @IsOptional()
    @IsNumber()
    totalBillAmount: number;

    @IsOptional()
    @IsNumber()
    consultationFee: number;

}
