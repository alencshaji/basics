import { IsBoolean, IsOptional, IsString } from "class-validator";


export class CreateVendorDto {

    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsString()
    @IsOptional()
    gstNo: string;

    @IsString()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    location: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsBoolean()
    isActive: boolean;

}

