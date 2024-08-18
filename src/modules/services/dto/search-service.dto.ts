import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ServiceSearchDto{

    @ApiProperty({required:false})
    @IsOptional()
    search?: string;

    @ApiProperty({required:false})
    @IsOptional()
    page?: string;

    @ApiProperty({required:false})
    @IsOptional()
    limit?: string;

    @ApiProperty({required:false})
    @IsOptional()
    isActive?: string;

}