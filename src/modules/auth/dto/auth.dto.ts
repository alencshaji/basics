import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
  @ApiProperty({ example: 'admin@demo.com', description: 'The user ID' })
  email: string;
  @ApiProperty({ example: 'password123', description: 'The user password' })
  password: string;
}
