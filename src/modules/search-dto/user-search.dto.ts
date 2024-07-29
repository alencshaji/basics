import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class searchDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
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

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?:boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    department?:string;
  }