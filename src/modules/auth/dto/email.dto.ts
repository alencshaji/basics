import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class EmailDto {
    @ApiProperty()
    @IsString()
    email:string
}