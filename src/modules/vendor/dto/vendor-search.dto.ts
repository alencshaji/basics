import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";

export class VendorSearchDto{
    @ApiProperty({required:false})
    @IsOptional()
    search?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    page?: number;
  
    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    limit?: number;
}