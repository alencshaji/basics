import { IsBoolean, IsOptional, IsString } from "class-validator";


export class CreateSaleDto {

    @IsOptional()
    @IsString()
    saleId:string;

    @IsString()
    @IsOptional()
    customerPhone: string;

    @IsString()
    @IsOptional()
    customerState: string;

    @IsString()
    @IsOptional()
    customerName: string;

    @IsString()
    billDate: Date;

    @IsBoolean()
    isDraft: boolean;
}
