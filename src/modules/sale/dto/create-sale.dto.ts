import { IsBoolean, IsOptional, IsString } from "class-validator";


export class CreateSaleDto {

    @IsOptional()
    @IsString()
    saleId:string;

    @IsString()
    @IsOptional()
    patientCode: string;

    @IsString()
    @IsOptional()
    patientState: string;

    @IsString()
    @IsOptional()
    patientName: string;

    @IsString()
    @IsOptional()
    doctorName: string;

    @IsString()
    billDate: Date;

    @IsBoolean()
    isDraft: boolean;
}
