import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { StockItemsService } from './stock-items.service';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { CreateStockLocationDto } from './dto/create-stockLocation.dto';
import { UpdateStockLocationDto } from './dto/update-stockLocation';
import { SearchStockItemDto } from './dto/search-stock-item.dto';
import { searchStockOnHoldDto } from './dto/search-stockOnHold.dto';


@ApiBearerAuth('defaultBearerAuth')
@ApiTags('Stock Items')
@UseGuards(AccessTokenGuard)

@Controller('stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) { }


  @Post('create-stock-location')
  createstockLocation(@Req() req, @Body() createStockLocationDto: CreateStockLocationDto) {
    return this.stockItemsService.createStockLocation(createStockLocationDto, req.user['sub'],req.user['companyId']);
  }

  @Get('available-items')
  findAllAvailable(@Req() req:any,@Query() query: SearchStockItemDto) {
    return this.stockItemsService.findAvailableStock(query,req.user['companyId']);
  }

  @Get('all-stock-items')
  findAll(@Req() req:any,@Query() query: SearchStockItemDto) {
    return this.stockItemsService.findAll(query,req.user['companyId']);
  }

  @Get('all-stock-history')
  async findAllStockHistory(@Req() req:any,@Query() query: SearchStockItemDto) {
    return await this.stockItemsService.findAllStockHistory(query,req.user['companyId']);
  }

  @Get('count-items')
  countItems(@Req() req:any) {
    return this.stockItemsService.countStockItems(req.user['companyId'])
  }



  @Get('all-locations')
  async findAllLocations(@Req() req:any) {
    return await this.stockItemsService.findAllLocations(req.user['companyId']);
  }




  @Get('all-items-by-masterId/:id')
  findAllByMasterId(@Param('id') id: string,@Query() query: SearchStockItemDto) {
    return this.stockItemsService.findAllByMasterId(id,query);
  }

  @Get('all-history-items-by-masterId/:id')
  findAllStockHistoryBymasterId(@Param('id') id: string,@Query() query: SearchStockItemDto) {
    return this.stockItemsService.findAllStockHistoryBymasterId(id,query);
  }

  @Get('by-stock-id/:id')
  findByStockId(@Param('id') id: string){
    return this.stockItemsService.findByStockId(id);
  }
 

  @Patch('stock-location/:id')
  async updateStockLocation(@Req() req, @Param('id') id: string, @Body() updateStockLocationDto: UpdateStockLocationDto) {
    return await this.stockItemsService.updateStockLocation(id, updateStockLocationDto, req.user['sub'],req.user['companyId']);
  }

  @Patch('update-stock-item/:id')
  async updateStockItem(@Req() req, @Param('id') id: string, @Body() updateStockItemDto: UpdateStockItemDto) {
    return await this.stockItemsService.updateStockItem(id, updateStockItemDto, req.user['sub']);
  }

  // stock on hold

  @Get('stock-on-hold')
  async stockOnHold(@Req()req:any,@Query()query:searchStockOnHoldDto){
    return await this.stockItemsService.stockOnHoldLast60Days(query,req.user['companyId'])
  }

  @Get('dbFix')
  async dbFix(){
    return await this.stockItemsService.dbFix()
  }


}
