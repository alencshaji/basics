import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import {  ServiceSearchDto } from './dto/search-service.dto';


@ApiBearerAuth('defaultBearerAuth')
@ApiTags('services')
@UseGuards(AccessTokenGuard)

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(@Req() req,@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto,req?.user['sub'],req?.user['companyId']);
  }

  @Get()
  findAll(@Req() req:any,@Query() searchDto: ServiceSearchDto) {
    return this.servicesService.findAll(searchDto,req.user['companyId']);
  }

  @Get('list')
  listService(@Req() req:any) {
    return this.servicesService.listAll(req.user['companyId']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req,@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto,req?.user['sub']);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
