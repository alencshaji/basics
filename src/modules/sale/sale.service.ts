import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto, UpdateSaleDetailDto } from './dto/update-sale.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sale } from 'src/schemas/sale.schema';
import { Model, Types } from 'mongoose';
import { StockItem } from 'src/schemas/stockItem.schema';
import { CreateSaleItemDto } from './dto/create-saleItem.dto';
import { ItemMaster } from 'src/schemas/item-master.schema';
import { SaleItem } from 'src/schemas/saleItem.schema';
import { SearchSaleDto } from './dto/search-sale.dto';
import { SaleReturn } from 'src/schemas/saleReturn.schema';
import { SaleReturnItem } from 'src/schemas/saleReturnItem.schema';
import { SaleReturnDto } from './dto/create-saleReturn.dto';
import { SaleReturnItemDto } from './dto/create-saleReturnItem.dto';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { error } from 'console';
import { IdService } from '../common/services/id.service';
@Injectable()
export class SaleService {

  constructor(
    @InjectModel('Sale') private readonly saleModel: Model<Sale>,
    @InjectModel('SaleItem') private readonly saleItemModel: Model<SaleItem>,
    @InjectModel('StockItem') private readonly stockItemModel: Model<StockItem>,
    @InjectModel('ItemMaster') private readonly itemMasterModel: Model<ItemMaster>,
    @InjectModel('SaleReturn') private readonly saleReturnModel: Model<SaleReturn>,
    @InjectModel('SaleReturnItem') private readonly saleReturnItemModel: Model<SaleReturnItem>,
    @InjectModel('Manufacturer') private readonly manufacturerModel: Model<Manufacturer>,
    private readonly idService: IdService,
  ) { }

  async create(createSaleDto?: CreateSaleDto, userId?: string, companyId?: string) {
    let sale;
    sale = await this.createDirectSale(createSaleDto, userId, companyId)
    return {
      status: 'success',
      message: 'Sale created successfully',
      sale: sale
    }
  }

  async createDirectSale(createSaleDto?: CreateSaleDto, userId?: string, companyId?: string) {
    try {
      const sale = await this.saleModel.create({
        ...createSaleDto,
        uniqueCode: await this.idService.generateId('SALE', new Types.ObjectId(companyId)),
        isActived: true,
        isDraft: createSaleDto.isDraft,
        companyId: new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId),
      });
      return sale

    } catch (e) {
      console.log(e)
      throw new BadRequestException(e.message);
    }

  }


  async updateSale(id?: string, updateSaleDto?: UpdateSaleDetailDto, userId?: string) {

    const sale = await this.saleModel.findById(id).exec()
    if (!sale) throw new BadRequestException('Sale not found');

    const totalItems = await this.saleItemModel.countDocuments({ saleId: id });

    // Update the sale document
    const updatedSale = await this.saleModel.findByIdAndUpdate(
      id,
      {
        ...updateSaleDto,
        totalItems: totalItems,
        updatedBy: new Types.ObjectId(userId),
      },
      { new: true }
    ).exec();

    return {
      status: 'success',
      message: 'Sale added successfully',
      sale: updatedSale
    }

  }




  async removeSaleItem(id?: string, userId?: string) {

    const saleItem = await this.saleItemModel.findById(id).exec()
    if (!saleItem) throw new BadRequestException('Sale item not found');

    const stock = await this.addStock(saleItem.stockId, saleItem.quantity, userId)
    if (!stock) throw new BadRequestException('Stock not found');
    await this.saleItemModel.findByIdAndDelete(id)
    return {
      status: 'success',
      message: 'Sale item removed successfully',
      stock: stock
    }


  }

  async addStock(id?: any, quantity?: number, userId?: string) {

    const stock = await this.stockItemModel.findById(id).exec();
    if (!stock) {
      throw new BadRequestException('Stock not found');
    }

    const updatedStock = await this.stockItemModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $inc: { quantity: quantity },
        $set: { updatedBy: new Types.ObjectId(userId) }
      },
      { new: true }
    );

    const result = await this.stockItemModel.aggregate([
      { $match: { itemMasterId: new Types.ObjectId(stock.itemMasterId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);

    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
    const itemMaster = await this.itemMasterModel.findByIdAndUpdate(
      stock.itemMasterId,
      { quantity: totalQuantity },
      { new: true }
    );
    return { updatedStock, itemMaster }

  }

  async createSaleItem(createSaleItemDto: CreateSaleItemDto, userId: string,companyId:string) {
    let stock, igst = 0, cgst = 0, sgst = 0;

    if (createSaleItemDto.igst != 0) {
      igst = createSaleItemDto.igst / 100;
    }
    if (createSaleItemDto.cgst != 0) {
      cgst = createSaleItemDto.cgst / 100;
    }
    if (createSaleItemDto.sgst != 0) {
      sgst = createSaleItemDto.sgst / 100;
    }

    const sale = await this.saleModel.findById(createSaleItemDto.saleId);
    if (!sale) throw new BadRequestException('Sale not found');

    try {
      const grossTotal = createSaleItemDto.unitRate * createSaleItemDto.quantity;
      const igstValue = igst * grossTotal;
      const cgstValue = cgst * grossTotal;
      const sgstValue = sgst * grossTotal;
      const total = grossTotal + igstValue + cgstValue + sgstValue;
      const threeMonthsFromNow = new Date();

      const stockItem = await this.stockItemModel.findById(createSaleItemDto.stockId);
      if (!stockItem) throw new BadRequestException('Stock not found');

      const itemMaster = await this.itemMasterModel.findById(stockItem.itemMasterId);
      if (!itemMaster) throw new BadRequestException('ItemMaster not found');

      const manufacturer = await this.manufacturerModel.findById(itemMaster.manufacturerId);
      if (!manufacturer) throw new BadRequestException('Manufacturer not found');

      if (createSaleItemDto._id) delete createSaleItemDto._id

      let remainingQuantity = createSaleItemDto.quantity;

      if (stockItem.quantity > 0) {
        const allocatedQuantity = Math.min(stockItem.quantity, remainingQuantity);
        remainingQuantity -= allocatedQuantity;

        const saleItem = await this.saleItemModel.create({
          ...createSaleItemDto,
          saleId: sale._id,
          stockId: stockItem._id,
          itemMasterId: itemMaster._id,
          itemMasterName: itemMaster.name,
          expiryDate: stockItem.expiryDate,
          manufacturerId: manufacturer._id,
          manufacturerName: manufacturer.name,
          igstValue: igstValue * (allocatedQuantity / createSaleItemDto.quantity),
          cgstValue: cgstValue * (allocatedQuantity / createSaleItemDto.quantity),
          sgstValue: sgstValue * (allocatedQuantity / createSaleItemDto.quantity),
          grossTotal: grossTotal * (allocatedQuantity / createSaleItemDto.quantity),
          total: total * (allocatedQuantity / createSaleItemDto.quantity),
          quantity: allocatedQuantity,
          createdBy: new Types.ObjectId(userId),
          updatedBy: new Types.ObjectId(userId),
          ownedBy: new Types.ObjectId(userId),
          companyId:new Types.ObjectId(companyId),
        });
        if (saleItem) {
          await this.stockItemModel.findOneAndUpdate(
            { _id: stockItem._id },
            { $inc: { quantity: -allocatedQuantity }, $set: { isUsed: true } },
            { new: true }
          );
        }

        const stockAggregation = await this.stockItemModel.aggregate([
          {
            $match: { itemMasterId: stockItem.itemMasterId },
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
            },
          },
        ]).exec();

        const totalQuantity = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

        const updateQtyItemMaster = await this.itemMasterModel.findByIdAndUpdate(
          stockItem.itemMasterId,
          { quantity: totalQuantity },
          { new: true }
        );
      }

      if (remainingQuantity > 0) {
        const stockItemsList = await this.stockItemModel.aggregate([
          {
            $match: {
              itemMasterId: stockItem.itemMasterId,
              expiryDate: { $gte: threeMonthsFromNow },
            },
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
              data: { $push: "$$ROOT" },
            },
          },
          {
            $project: {
              totalQuantity: 1,
              stockItemList: "$data",
            },
          },
        ]).exec();

        const totalQuantity = stockItemsList.length > 0 ? stockItemsList[0].totalQuantity : 0;
        const stockItemList = stockItemsList.length > 0 ? stockItemsList[0].stockItemList : [];

        if (totalQuantity < remainingQuantity) {
          throw new BadRequestException(`Insufficient stock. Available quantity: ${totalQuantity}`);
        }

        for (const stockItem of stockItemList) {
          if (remainingQuantity <= 0) break;
          if (stockItem.quantity > 0) {

            const allocatedQuantity = Math.min(stockItem.quantity, remainingQuantity);

            remainingQuantity -= allocatedQuantity;
            const saleItem = await this.saleItemModel.create({
              ...createSaleItemDto,
              saleId: sale._id,
              stockId: stockItem._id,
              batch: stockItem.batch,
              itemMasterId: itemMaster._id,
              itemMasterName: itemMaster.name,
              expiryDate: stockItem.expiryDate,
              manufacturerId: manufacturer._id,
              manufacturerName: manufacturer.name,
              igstValue: igstValue * (allocatedQuantity / createSaleItemDto.quantity),
              cgstValue: cgstValue * (allocatedQuantity / createSaleItemDto.quantity),
              sgstValue: sgstValue * (allocatedQuantity / createSaleItemDto.quantity),
              grossTotal: grossTotal * (allocatedQuantity / createSaleItemDto.quantity),
              total: total * (allocatedQuantity / createSaleItemDto.quantity),
              quantity: allocatedQuantity,
              companyId:new Types.ObjectId(companyId),
              createdBy: new Types.ObjectId(userId),
              updatedBy: new Types.ObjectId(userId),
              ownedBy: new Types.ObjectId(userId),
            });

            if (saleItem) {
              await this.stockItemModel.findOneAndUpdate(
                { _id: stockItem._id },
                { $inc: { quantity: -allocatedQuantity }, $set: { isUsed: true } },
                { new: true }
              );
            }
            const updateQtyItemMaster = await this.itemMasterModel.findByIdAndUpdate(
              stockItem.itemMasterId,
              { quantity: totalQuantity },
              { new: true }
            );
          }
        }
      }

      return {
        status: 'success',
        message: 'Item added successfully',
        saleItem: stock
      };
    } catch (e) {
      console.log(e)
      throw new BadRequestException(e.message);
    }

  }



  async findAllSales(query?: SearchSaleDto, companyId?: string) {
    const search = query?.search
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const filter: any = { companyId: new Types.ObjectId(companyId) }

    if (search) {
      filter.$or=[
          { 'patientCode': { $regex: search, $options: 'i' } },
          { 'patientName': { $regex: search, $options: 'i' } },
          { 'uniqueCode': { $regex: search, $options: 'i' } }
        ]
      
    } else if (query.date) {
      const startDate = new Date(query.date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(query.date);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.billDate = { $gte: startDate, $lt: endDate };
    }

    const sales = await this.saleModel.find({ ...filter }).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).exec()
    const total = await this.saleModel.countDocuments({ ...filter }).exec();
    return { total: total, sales: sales }
  }

  async findAllSaleItem(id?: string, query?: SearchSaleDto) {
    if (!id) {
      throw new Error("Sale ID is required.");
    }

    const page = Number(query?.page) || 1;
    const limit = query?.limit ? Number(query?.limit) : 1000;

    const saleItems = await this.saleItemModel.aggregate([
      {
        $match: { saleId: new Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'stockitems',
          localField: 'stockId',
          foreignField: '_id',
          as: 'stock',
        },
      },
      {
        $unwind: {
          path: '$stock',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          saleId: 1,
          itemMasterId: 1,
          itemMasterName: 1,
          expiryDate: 1,
          hsn: 1,
          manufacturerId: 1,
          manufacturerName: 1,
          quantity: 1,
          locationName: '$stock.locationName',
          locationId: '$stock.locationId',
          boxNumber: '$stock.boxNumber',
          igst: 1,
          cgst: 1,
          sgst: 1,
          sgstValue: 1,
          cgstValue: 1,
          igstValue: 1,
          stockId: 1,
          mrp: 1,
          batch: 1,
          rate: 1,
          unitRate: 1,
          total: 1,
          returnedQty: 1,
          grossTotal: 1,
          createdAt: 1,
        },
      },
      {
        $facet: {
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [
            { $count: 'count' },
          ],
        },
      },
    ]);

    const totalCount = saleItems[0]?.totalCount[0]?.count || 0;
    const saleItemsData = saleItems[0]?.data || [];

    return {
      saleItems: saleItemsData,
      total: totalCount,
    };
  }

  async findOneSale(id: string) {
    const sale = await this.saleModel.findById(id).exec()
    if (!sale) throw new BadRequestException('Sale not found');
    return sale
  }

  async findBySaleCode(code: string) {
    const sale = await this.saleModel.findOne({ uniqueCode: code, isDraft: false }).exec()
    if (!sale) throw new BadRequestException('Sale Bill not found');
    return sale
  }


  /// sale-return

  async createSaleReturn(createSaleReturnDto: SaleReturnDto, userId: string, companyId?: string) {
    let saleReturn, saleItems;
    const sale = await this.saleModel.findById(createSaleReturnDto.saleId).exec()
    if (!sale) throw new BadRequestException('Sale bill not found');
    try {
      saleReturn = await this.saleReturnModel.create({
        ...createSaleReturnDto,
        saleId: sale._id,
        companyId: new Types.ObjectId(companyId),
        uniqueCode: await this.idService.generateId('SALE-RETURN', new Types.ObjectId(companyId)),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId)
      })

      saleItems = await this.createSaleReturnItems(createSaleReturnDto.saleReturnItemDetails, saleReturn._id, userId);

      return {
        status: 'success',
        message: 'Sale return created successfully',
        saleReturn: saleReturn,
        saleItems: saleItems
      }
    }
    catch (e) {
      console.log(e)
      throw new BadRequestException(e.message);
    }


  }


  async createSaleReturnItems(saleReturnItemDetails: SaleReturnItemDto[], returnId: any, userId: string) {
    if (!returnId) throw new BadRequestException('Sale return id is required');
    const saleItems = [];

    for (const createSaleReturnItemDto of saleReturnItemDetails) {
      let itemMaster, igst = 0, cgst = 0, sgst = 0;

      if (createSaleReturnItemDto.itemMasterId) {
        itemMaster = await this.itemMasterModel.findById(createSaleReturnItemDto.itemMasterId).exec();
        if (!itemMaster) throw new BadRequestException('Item master not found');
      }


      const saleReturnItem = await this.saleReturnItemModel.create({
        ...createSaleReturnItemDto,
        saleReturnId: returnId,
        itemMasterId: new Types.ObjectId(createSaleReturnItemDto.itemMasterId),
        saleItemId: new Types.ObjectId(createSaleReturnItemDto.saleItemId),
        itemMasterName: itemMaster?.name,
        companyId: new Types.ObjectId(itemMaster?.companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId),
        stockId: new Types.ObjectId(createSaleReturnItemDto.stockId),
      });

      const stock = await this.addReturnStock(createSaleReturnItemDto.stockId, createSaleReturnItemDto.quantity, userId);

      if (createSaleReturnItemDto.saleItemId) {
        const result = await this.saleReturnItemModel.aggregate([
          { $match: { saleItemId: new Types.ObjectId(createSaleReturnItemDto.saleItemId) } },
          { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
        ]);
        const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;

        const updateReturnedQty = await this.saleItemModel.findByIdAndUpdate(
          createSaleReturnItemDto.saleItemId,
          { returnedQty: totalQuantity },
          { new: true }
        );
      }

      saleItems.push({
        saleReturnItem: saleReturnItem,
        stock: stock,
      });
    }

    return {
      status: 'success',
      message: 'Sale return items created successfully',
      saleItems: saleItems
    }
  }

  async addReturnStock(id?: any, quantity?: number, userId?: string) {

    const stock = await this.stockItemModel.findById(id).exec()
    if (!stock) throw new BadRequestException('Stock not found')

    const updatedStock = await this.stockItemModel.findOneAndUpdate(
      { _id: id },
      {
        $inc: { quantity: quantity },
        $set: { updatedBy: new Types.ObjectId(userId) }
      },
      { new: true }
    );

    const result = await this.stockItemModel.aggregate([
      { $match: { itemMasterId: new Types.ObjectId(stock.itemMasterId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);

    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
    const itemMaster = await this.itemMasterModel.findByIdAndUpdate(
      stock.itemMasterId,
      { quantity: totalQuantity },
      { new: true }
    );

    return { updatedStock, itemMaster }

  }


  async saleReturnFindAll(query?: SearchSaleDto, companyId?: string) {
    const search = query?.search;
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (search) {
      filter.$or = [
        { uniqueCode: { $regex: search, $options: 'i' } },
        { saleCode: { $regex: search, $options: 'i' } }
      ];
    } else if (query.date) {
      const startDate = new Date(query.date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(query.date);
      endDate.setUTCHours(23, 59, 59, 999);

      filter.billDate = { $gte: startDate, $lte: endDate };

    }



    const saleReturn = await this.saleReturnModel.find({ ...filter }).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).exec();
    const total = await this.saleReturnModel.countDocuments({ ...filter }).exec();

    return { saleReturn, total };
  }


  async saleReturnFindOne(id: string) {
    const saleReturn = await this.saleReturnModel.findById(id).exec()
    if (!saleReturn) throw new BadRequestException('Sale return not found');
    return saleReturn
  }

  async saleReturnItem(returnId: string) {
    const saleReturnItem = await this.saleReturnItemModel.find({ saleReturnId: new Types.ObjectId(returnId) }).exec()
    if (!saleReturnItem) throw new BadRequestException('Sale return item not found');
    return saleReturnItem
  }



}