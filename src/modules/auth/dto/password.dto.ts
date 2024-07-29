import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ForgotPasswordDto {

    @ApiProperty()
    @IsString()
    otp:string;

    @ApiProperty()
    @IsString()
    password:string;


    // @ApiProperty()
    // @IsString()
    // passwordConfirm: string; // Add this line if needed

    @ApiProperty()
    @IsString()
    email:string
}