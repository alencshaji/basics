import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";


export class SearchPurchaseDto{

    @ApiProperty({required:false})
    @IsOptional()
    search:string;

    @ApiProperty({required:false})
    @IsOptional()
    page:number;

    @ApiProperty({required:false})
    @IsOptional()
    limit:number;

    @ApiProperty({required:false})
    @IsOptional()
    date:Date;


}