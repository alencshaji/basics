import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Body } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/password.dto';
import { OTPVerifyDto } from './dto/otp-verify.dto';
import { EmailDto } from './dto/email.dto';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { RefreshTokenGuard } from '../common/guards/refreshToken.guard';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,private readonly jwtService: JwtService) {}

  
  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

    // @Post('signup')
  // signup(@Body() createUserDto: CreateUserDto) {
  //   return this.authService.signUp(createUserDto);
  // }
  

  @Post('send-otp')
  async requestPasswordReset(@Body() body:EmailDto) {
    return this.authService.sendOtp(body.email)
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body:OTPVerifyDto) {
    return this.authService.verifyOtp(body.email,body.otp)
  }

  // @UseGuards(AccessTokenGuard)
  @Post('reset-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ) {
    const { otp, password, email } = forgotPasswordDto;
    // const userId = req.user['sub']; 

    return this.authService.resetPassword( otp, password, email);
  }

  @Get('logout')
  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(AccessTokenGuard)
  logout(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = this.jwtService.decode(token);
    
    return this.authService.logout(decodedToken.sub);
  }

  @ApiBearerAuth('defaultBearerAuth')
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = this.jwtService.decode(token);
    const userId = decodedToken.sub;
    const refreshToken = req.user['refreshToken'];
    
    return this.authService.refreshTokens(userId, refreshToken);
  }



}
