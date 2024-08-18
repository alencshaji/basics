import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {

    @IsString()
    name: string;

    @IsString()
    area: string;

    @IsString()
    @IsOptional()
    description: string;   
    
    @IsNumber()
    cost:number;

    @IsOptional()
    createdBy: string;
  
    @IsOptional()
    updatedBy: any;
  
    @IsOptional()
    ownedBy: string;

}
