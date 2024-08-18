import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateItemMasterDto {

    @IsString()
    @IsOptional()
    itemMasterId: string;

    @IsString()
    @IsOptional()
    vendorId: string;

    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    reorderLevel: number;


    @IsString()
    @IsOptional()
    dosage: string;

    @IsString()
    @IsOptional()
    packId: string;

    @IsString()
    @IsOptional()
    manufacturerId: string;


    @IsString()
    @IsOptional()
    hsn: string;

    @IsNumber()
    @IsOptional()
    batchCount: number;

    @IsNumber()
    @IsOptional()
    sgst: number;

    @IsNumber()
    @IsOptional()
    cgst: number;

    @IsNumber()
    @IsOptional()
    igst: number;


}