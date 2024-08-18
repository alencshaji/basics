import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePackDto {

    @IsString()
    name: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    createdBy: string;

    @IsOptional()
    updatedBy: any;

    @IsOptional()
    ownedBy: string;

}
