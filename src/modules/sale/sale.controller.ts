import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDetailDto, UpdateSaleDto } from './dto/update-sale.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { CreateSaleItemDto } from './dto/create-saleItem.dto';
import { SearchSaleDto } from './dto/search-sale.dto';
import { SaleReturnDto } from './dto/create-saleReturn.dto';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('Sale')
@UseGuards(AccessTokenGuard)

@Controller('sale')
export class SaleController {
  constructor(private readonly saleService: SaleService) { }

  @Post()
  async create(@Req() req, @Body() createSaleDto: CreateSaleDto) {
    return await this.saleService.create(createSaleDto, req.user['sub'],req.user['companyId']);
  }

  @Post('create-sale-item')
  async createSaleItem(@Req() req, @Body() createSaleItemDto: CreateSaleItemDto) {
    return await this.saleService.createSaleItem(createSaleItemDto, req.user['sub'],req.user['companyId']);
  }

  @Post('create-sale-return')
  async createSaleReturn(@Req() req, @Body() createSaleReturn: SaleReturnDto) {
    return await this.saleService.createSaleReturn(createSaleReturn, req.user['sub'],req.user['companyId']);
  }


  @Get()
  async findAll(@Req() req:any,@Query() search: SearchSaleDto) {
    return await this.saleService.findAllSales(search,req.user['companyId']);
  }

  @Get('get-sale-return')
  async findAllreturn(@Req() req:any,@Query() search: SearchSaleDto) {
    return await this.saleService.saleReturnFindAll(search,req.user['companyId']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.saleService.findOneSale(id);
  }

  @Get('sale-return/:id')
  findOneSaleReturn(@Param('id') id: string) {
    return this.saleService.saleReturnFindOne(id);
  }

  @Get('saleReturn-item/:id')
  findOneSalereturnItem(@Param('id') id: string) {
    return this.saleService.saleReturnItem(id);
  }



  @Get('sale-item/:id')
  async findAllSaleItem(@Param('id') id: string, @Query() search: SearchSaleDto) {
    return await this.saleService.findAllSaleItem(id, search);
  }


  @Get('by-code/:no')
  findByCode(@Param('no') no: string) {
    return this.saleService.findBySaleCode(no);
  }

  @Patch(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateSaleDto: UpdateSaleDetailDto) {
    return await this.saleService.updateSale(id, updateSaleDto, req.user['sub']);
  }



  @Delete('sale-item/:id')
  async removeSaleItem(@Param('id') id: string) {
    return await this.saleService.removeSaleItem(id);
  }
}
