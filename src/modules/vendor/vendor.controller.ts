import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { VendorSearchDto } from './dto/vendor-search.dto';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('Vendor')
@UseGuards(AccessTokenGuard)

@Controller('vendor')

export class VendorController {
  constructor(private readonly vendorService: VendorService) { }

  @Post()
  create(@Req() req, @Body() createVendorDto?: CreateVendorDto) {
    return this.vendorService.create(createVendorDto, req?.user['sub'],req.user['companyId']);
  }

  @Get()
  findAll(@Req() req :any, @Query() searchDto: VendorSearchDto,
  ) {
    return this.vendorService.findAll(searchDto,req.user['companyId']);
  }


  @Get('company-list')
  findCompanyList(@Req() req:any) {
    return this.vendorService.findCompanyList(req.user['companyId']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorService.update(id, updateVendorDto, req?.user['sub'],req.user['companyId']);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.vendorService.remove(id);
  // }
}
