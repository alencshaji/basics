import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseDto } from './create-purchase.dto';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMode, PaymentStatus } from 'src/schemas/purchase.schema';

export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) { }

export class UpdatePurchaseDetailsDto extends PartialType(CreatePurchaseDto) {

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
    mrpTotal: number;

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


}


