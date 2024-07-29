import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../common/services/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService, JwtService, ConfigService],
  exports: [UserService],
})
export class UserModule {}
