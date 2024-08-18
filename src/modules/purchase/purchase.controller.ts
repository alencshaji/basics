import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDetailsDto, UpdatePurchaseDto } from './dto/update-purchase.dto';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateItemMasterDto } from './dto/create-itemmaster.dto';
import { PurchaseItemDto } from './dto/create-purchaseItem.dto';
import { SearchPurchaseDto } from './dto/search-purchase.dto';
import { SearchItemMasterDto } from './dto/search-itemMaster.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchaseReturn.dto';

@ApiBearerAuth('defaultBearerAuth')
@ApiTags('Purchase')
@UseGuards(AccessTokenGuard)

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }

  @Post()
  async create(@Req() req, @Body() createPurchaseDto: CreatePurchaseDto) {
    return await this.purchaseService.create(createPurchaseDto, req.user['sub'],req.user['companyId']);
  }

  @Post('item-master')
  async createItemMaster(@Req() req, @Body() createItemMasterDto: CreateItemMasterDto) {
    return await this.purchaseService.createItemMaster(createItemMasterDto, req.user['sub'],req.user['companyId']);
  }

  @Post('items')
  async createPurchaseItem(@Req() req, @Body() createPurchaseItemDto: PurchaseItemDto) {
    return await this.purchaseService.createPurchaseItem(createPurchaseItemDto, req.user['sub'],req.user['companyId']);
  }


  @Post('create-purchaseReturn')
  async createPurchaseReturn(@Req() req, @Body() createPurchaseReturn: CreatePurchaseReturnDto) {
    return await this.purchaseService.createPurchaseReturn(createPurchaseReturn, req.user['sub'],req.user['companyId']);
  }


  @Get('master-products')
  async findAllItemMaster(@Req() req:any) {
    return await this.purchaseService.findMasterProducts(req.user['companyId']);
  }

  @Get('all-master-products')
  async findMasterProudcts(@Req() req:any,@Query() query: SearchItemMasterDto) {
    return await this.purchaseService.findMasterProductsList(query,req.user['companyId']);
  }

  @Get('update-all-purchasedOn')
  async updatedPurchasedOn() {
    return await this.purchaseService.updatedPurchasedOn();
  }

  @Get('bills')
  async findAllPurchase(@Req() req:any,@Query() query: SearchPurchaseDto) {
    return await this.purchaseService.findAllPurchase(query,req.user['companyId']);
  }

  @Get('list-purchaseReturn')
  async listPurchaseReturn(@Req() req:any,@Query() query: SearchPurchaseDto) {
    return await this.purchaseService.listPurchaseReturn(query,req.user['companyId']);
  }


  @Get('get-purchase/:id')
  getPurchase(@Param('id') id: string) {
    return this.purchaseService.findPurchase(id);
  }

  @Get('get-purchaseReturn/:id')
  getPurchaseReturn(@Param('id') id: string) {
    return this.purchaseService.getPurchaseReturn(id);
  }


  @Get('purchase-items/:purchaseId')
  findAllPurchaseItems(@Param('purchaseId') purchaseId: string, @Query() query: SearchPurchaseDto) {
    return this.purchaseService.findAllPurchaseItems(purchaseId, query);
  }


  @Get('purchaseReturn-items/:purchaseReturnId')
  listPurchaseReturnItem(@Param('purchaseReturnId') purchaseReturnId: string) {
    return this.purchaseService.listPurchaseReturnItem(purchaseReturnId);
  }



  @Patch(':id')
  async updatePurchase(@Req() req, @Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDetailsDto) {
    return await this.purchaseService.updatePurchase(id, updatePurchaseDto, req.user['sub'])
  }

  @Patch('purchaseReturn-status/:id')
  @ApiQuery({ name: 'status', required: true })
  async updateStatus(@Req() req, @Param('id') id: string, @Query('status') status: string) {
    return await this.purchaseService.updateStatus(id,status , req.user['sub'])
  }

  @Delete('purchase-item/:id')
  async deletePurchaseItem(@Req() req, @Param('id') id: string) {
    return await this.purchaseService.deletePurchaseItem(id, req?.user['sub']);
  }




  //manufacturer

  @Post('manufacturer')
  async createManufacturer(@Req() req, @Body() createManufacturerDto: CreateManufacturerDto) {
    return await this.purchaseService.createManufacture(createManufacturerDto, req.user['sub'],req.user['companyId']);
  }

  @Get('manufacturer')
  async findAllManufacturers(@Req() req:any) {
    return await this.purchaseService.findAllManufacture(req.user['companyId']);
  }



  @Get('manufacturer/:id')
  async findOneManufacturer(@Param('id') id: string) {
    return await this.purchaseService.findOneManufacture(id);
  }


  @Get('invoiceNumber/:vendorId')
  async invoiceNumberByvendorId(@Req() req, @Param('vendorId') vendorId: string) {
    return await this.purchaseService.invoiceNumberByvendorId(vendorId, req.user['companyId']);
  }

  @Get('find-one-bill')
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'invoiceNumber', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  async findOnePurchaseBill(
    @Req() req:any,
    @Query('code') code?: string,
    @Query('invoiceNumber') invoiceNumber?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    return await this.purchaseService.findOnePurchaseBill(code, invoiceNumber, vendorId, req.user['companyId']);
  }


  @Patch('manufacturer/:id')
  async updateManufacturer(@Req() req, @Param('id') id: string, @Body() updateManufacturerDto: UpdateManufacturerDto) {
    return await this.purchaseService.udpateManufacture(id, updateManufacturerDto, req.user['sub']);
  }


  @Delete('manufacturer/:id')
  async removeManufacturer(@Param('id') id: string) {
    return await this.purchaseService.deleteManufacture(id);
  }

}
