import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsArray,
  IsOptional,
} from 'class-validator';


export enum Roles {
 ADMIN = 'admin',
 LAB = 'lab',
 RECEPTION = 'reception',
 PHARMACY = 'pharmacy'
}

export class CreateUserDto {

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  name: string;

  @IsString()
  email: string;


  @IsString()
  role: Roles;

  @IsString()
  department:string;
}
