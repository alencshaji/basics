import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { PackService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('pack')
@UseGuards(AccessTokenGuard)

@Controller('pack')

export class PackController {
  constructor(private readonly packService: PackService) { }

  @Post()
  async create(@Req() req, @Body() createPackDto: CreatePackDto) {
    return await this.packService.create(createPackDto, req.user['sub'],req.user['companyId']);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(@Req() req:any,@Query('search') search?: string,@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.packService.findAll(search, page, limit,req.user['companyId']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    return this.packService.update(id, updatePackDto, req.user['sub']);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packService.remove(id);
  }
}
