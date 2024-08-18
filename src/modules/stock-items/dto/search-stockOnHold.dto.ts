import { ApiProperty } from "@nestjs/swagger";
import { IsString ,IsNumber,IsOptional,Min } from "class-validator";

export class searchStockOnHoldDto{

    @ApiProperty({required:false})
    page:number;

    @ApiProperty({required:false})
    limit:number;
}