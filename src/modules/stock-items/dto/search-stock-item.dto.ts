import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";


export class SearchStockItemDto{

    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    search?:string;

    @ApiProperty({required:false})
    @IsString()
    @IsOptional()
    date?:string;

    @ApiProperty({required:false})
    @IsOptional()
    page:number;

    @ApiProperty({required:false})
    @IsOptional()
    limit:number;

}