import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import mongoose, { Model, Query, Types, UpdateWriteOpResult } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto, Roles } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WithRoles } from '../auth/decorator/role.decorator';
import { EmailService } from '../common/services/email.service';
import { searchDto } from '../search-dto/user-search.dto';
import { Company } from 'src/schemas/company.schema';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Company.name) private companyModel: Model<Company>,

    private readonly emailService: EmailService,
  ) { }

  private hashData(data: string) {
    return argon2.hash(data);
  }

  private verifyHash(hash: string, data: string) {
    return argon2.verify(hash, data);
  }

  private generatePassword(length: number) {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    const passwordArray = Array.from({ length }, () => {
      const randomIndex = Math.floor(Math.random() * charset.length);
      return charset[randomIndex];
    });

    return passwordArray.join('');
  }

  async create(
    createUserDto: CreateUserDto,
    companyId:any
  ): Promise<User> {
    try{
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
        companyId:new Types.ObjectId(companyId)
      });
      if (existingUser) {
        throw new BadRequestException('Email is duplicate');
      }
      const password = this.generatePassword(8);
      const hashedPassword = await argon2.hash(password,{timeCost:10});
  
       // Validate department ID
       if (!Types.ObjectId.isValid(createUserDto.department)) {
        throw new BadRequestException('Invalid department ID');
      }
  
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      const company = await this.companyModel.findById(newUser.companyId)
      await this.emailService.sendWelcome(newUser, password,company.name);
  
      const createdNewUser = await newUser.save();
  
      return createdNewUser;
    }
    catch(error){
      console.log(error);
      throw error;
    }
    
  }
  
 
  async findByUserEmailId(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email });
      return user;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  async countUsers() {
    const total = await this.userModel.countDocuments().exec();
    const activeCount = { isActive: true };
    const inActiveCount = { isActive: false };
    const active = await this.userModel.countDocuments(activeCount).exec();
    const inActive = await this.userModel.countDocuments(inActiveCount).exec();
    return { total, active, inActive };
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string): Promise<User> {
    const objectId = new Types.ObjectId(id);
    return this.userModel.findOne({ _id: objectId });
  }

  async findAll(
    query?: searchDto,
    userId?: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) new BadRequestException('User does not exists');

    // if (query.isActive === 'true') {
    //     isActive = true;
    // }
    // if (isActive === 'false') {
    //   isActive = false;
    // }

    const search = query.search;
    const isActive = query.isActive;
    const department = query.department;
    const page = +query.page || 1;
    const limit = +query.limit || 1000;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (user) {
      filter.role = {$ne:Roles.ADMIN};
    }

    if (department) {
      filter.department = new mongoose.Types.ObjectId(department);
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (search) {
      filter.name = { $regex: new RegExp(search, 'i') };
    }

    const users = await this.userModel.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'departmentDetails',
        },
      },
      {
        $unwind: {
          path: '$departmentDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: '$_id',
          name: '$name',
          avatarUrl: '$avatarUrl',
          email: '$email',
          phoneNumber: '$phoneNumber',
          role: '$role',
          isActive: '$isActive',
          department: '$departmentDetails',
          designation: '$designation',
          createdAt: '$createdAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'total' }],
        },
      },
    ]);
    return {
      users: users[0]?.data || [],
      total: users[0]?.total[0]?.total || 0,
    };
  }

  async remove(id: string) {
    const deletedData = await this.userModel.findByIdAndRemove(id).exec();
    return deletedData;
  }

}
