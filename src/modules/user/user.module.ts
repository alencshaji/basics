import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../common/services/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Company, companySchema } from 'src/schemas/company.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {name:Company.name,schema:companySchema}
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService, JwtService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
