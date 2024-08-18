import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class SearchItemMasterDto{

    @ApiProperty({required:false})
    @IsOptional()
    search:string;

    @ApiProperty({required:false})
    @IsOptional()
    page:number;

    @ApiProperty({required:false})
    @IsOptional()
    limit:number;
}