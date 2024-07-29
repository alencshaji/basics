import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, Roles } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { WithRoles } from '../auth/decorator/role.decorator';
import { searchDto } from '../search-dto/user-search.dto';
import { RolesGuard } from '../auth/guards/roles.guards';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('user')
@UseGuards(AccessTokenGuard)

@Controller('user')

export class UserController {
  constructor(private readonly userService: UserService) {}

  // @WithRoles(Roles.ADMIN)
  @Post()
  async create(
    @Body()
    createUserDto: CreateUserDto,
  ) {
    const newUser = await this.userService.create(createUserDto);
    return {
      status: 'success',
      message: 'User Created',
      newUser,
    };
  }

  // @WithRoles(Roles.LAB)
  @UseGuards(RolesGuard)
  @Get()
  @ApiQuery({ name: 'department', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Req() req: any,
    @Query() searchDto?: searchDto,
  ) {
    return this.userService.findAll(
      searchDto,
      req.user['sub'],
    );
  }


  
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
   
  }

  
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const userDeleted = await this.userService.remove(id);
    return {
      status: 'success',
      message: 'User Deleted ',
      userDeleted,
    };
  }
}
