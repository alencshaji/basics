import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { User } from 'src/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../schemas/refreshToken.schema';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { EmailService } from '../common/services/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as fs from 'fs';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly emailService: EmailService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private refreshTokenRepository: Model<RefreshToken>,

  ) {

  }


  async signIn(data: AuthDto): Promise<any> {
    try {
      // Check if user exists
      const user = await this.userModel.findOne({ email: data.email });

      if (!user) {
        throw new BadRequestException('User does not exist');
      }

      if (user && user.isActive == false) {
        throw new BadRequestException('User is inactive')

      }

      // Verify the password
      const passwordMatches = await argon2.verify(user.password, data.password);
      if (!passwordMatches) {
        throw new BadRequestException('Password is incorrect');
      }



      // Generate tokens
      const tokens = await this.getTokens(
        user._id,
        user.name,
        user.role
      );
      await this.updateRefreshToken(user._id, tokens.refreshToken);

      const accessToken = tokens.accessToken;
      const refreshToken = tokens.refreshToken;

      // Do not return the hashed password
      user.password = undefined;

      return {
        status: 'success',
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async init(userId: string) {
    const user = await this.userModel.findById(userId);
    return {
      user
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    try {
      const currentUserToken = await this.refreshTokenRepository.findOne({
        userId: new Types.ObjectId(userId),
        active: true,
      });

      if (currentUserToken) {
        currentUserToken.active = false;
        await currentUserToken.save();
      }

      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 30);

      const hashedRefreshToken = await this.hashData(refreshToken);
      const createdRefresh = await this.refreshTokenRepository.create({
        userId,
        refreshToken: hashedRefreshToken,
        expiresIn: currentDate,
      });

      await createdRefresh.save();
    } catch (error) {
      throw error;
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async getTokens(userId: string, name: string,role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          name,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '1d',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          name,
          role
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }





  async sendOtp(email: string) {
    const users = await this.usersService.findByEmail(email);
    if (!users) {
      throw new NotFoundException('User not found');
    }
    let otp;
    // Generate OTP
    otp = this.generateOTP();

    // Send OTP via email
    await this.emailService.requestPasswordReset(email, otp);

    // Hash OTP
    const hashOtp = await this.hashData(otp);

    // Update user with hashed OTP
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const id = user._id;
    await this.userModel
      .findOneAndUpdate({ _id: new Types.ObjectId(id) }, { otp: hashOtp })
      .exec();

    return {
      status: 'success',
      message: 'Otp send successfully'
    };
  }


  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isOtpValid = await argon2.verify(user.otp, otp);

    if (!isOtpValid) {
      // Handle the case where the OTP is invalid
      throw new BadRequestException('Invalid OTP');
    }
    return {
      status: 'success',
      message: 'OTP verified',
    };
  }

  generateOTP() {
    // Generate a random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async resetPassword(otp: string, password: string, email: string) {
    // Check OTP and Password
    if (!otp || !password || !email) {
      throw new BadRequestException('OTP, newPassword, or email is missing.');
    }
    const user = await this.usersService.findByEmail(email);

    if (!user || !otp) {
      throw new NotFoundException('Resend Otp');
    }

    // Verify OTP
    const validate = await argon2.verify(user.otp, otp);

    if (!user.otp || !validate) {
      throw new BadRequestException('Invalid OTP');
    }
    const hashedPassword = await argon2.hash(password, { timeCost: 12 });
    console.log(hashedPassword);
    user.password = hashedPassword;
    user.otp = null;
    //  user.passwordConfirm = passwordConfirm;
    console.log(user);
    const id = user._id;
    return this.userModel.findOneAndUpdate({ _id: id }, user);
    return user;
  }

  async logout(userId: string) {
    console.log(userId);

    try {
      const currentUserToken = await this.refreshTokenRepository
        .findOne({
          userId: new Types.ObjectId(userId),
          active: true,
        })
        .exec();

      if (currentUserToken) {
        currentUserToken.active = false,
          await currentUserToken.save();
        return {
          status: 'success',
        };
      } else {
        throw new Error('Refresh token not found');
      }
    } catch (error) {
      throw new Error('Logout failed: ' + error.message);
    }
  }


 

  async refreshTokens(userId: string, refreshToken: string) {

    try {
      const user = await this.usersService.findById(userId);
      const userRefreshtoken = await this.refreshTokenRepository.findOne({
        userId: new Types.ObjectId(userId),
        active: true,
      });
      if (!user || !userRefreshtoken)
        throw new ForbiddenException('Access Denied');
      const refreshTokenMatches = await argon2.verify(
        userRefreshtoken.refreshToken,
        refreshToken,
      );

      if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
      const tokens = await this.getTokens(user._id, user.name, user.role);
      // await this.updateRefreshToken(user._id, tokens.refreshToken);
      delete tokens.refreshToken
      return tokens;
    } catch (error) {
      throw error
    }

  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    try {
      const user = await this.userModel.findOne({
        _id: new Types.ObjectId(userId),
        status: true,
      });
      if (!user) throw new ForbiddenException('Access Denied');
      const isPasswordValid = await argon2.verify(user.password, changePasswordDto.oldPassword);
      if (!isPasswordValid) throw new ForbiddenException('Access Denied');
      const hashedPassword = await argon2.hash(changePasswordDto.newPassword, { timeCost: 12 });
      user.password = hashedPassword;
      await user.save();
      return {
        status: 'success',
        message: 'Password changed successfully'
      };

    } catch (error) {
      throw error;
    }
  }





    // async signUp(createUserDto: CreateUserDto): Promise<any> {
  //   try {
  //     // Check if user exists
  //     const userExists = await this.userModel.findOne({
  //       email: createUserDto.email,
  //     });

  //     if (userExists) {
  //       throw new BadRequestException('User already exists');
  //     }

  //     // Hash password
  //     const hash = await argon2.hash(createUserDto.password);

  //     // Create a new user
  //     const newUser = await this.userModel.create({
  //       ...createUserDto,
  //       password: hash,
  //       role: createUserDto.role,
  //     });
  //     console.log('newuser :', newUser);

  //     const tokens = await this.getTokens(
  //       newUser._id,
  //       newUser.name,
  //       // newUser.permissions,
  //     );
  //     await this.updateRefreshToken(newUser._id, tokens.refreshToken);

  //     return tokens;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
