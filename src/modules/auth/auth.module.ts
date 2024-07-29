import { Module, Post } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UserService } from '../user/user.service';
import { RefreshToken, RefreshTokenSchema } from '../../schemas/refreshToken.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '../common/services/email.service';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RefreshToken.name,
        schema: RefreshTokenSchema,
      },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt-refresh' }), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }), 
    UserModule,
    ConfigModule.forRoot()
  ],
  // Include ConfigModule.forRoot()
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, ConfigService, EmailService], // Include ConfigService in providers
})
export class AuthModule {}
