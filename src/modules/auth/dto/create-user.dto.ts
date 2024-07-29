import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  Matches,
  IsArray,
} from 'class-validator';
import { Roles } from 'src/modules/user/dto/create-user.dto';


export class CreateUserDto {

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  role: Roles;

  password: string;

  @IsString()
  department: string;

  @IsString()
  designation: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
