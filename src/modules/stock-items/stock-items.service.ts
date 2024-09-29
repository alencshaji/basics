import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateStockItemDto } from './dto/create-stock-item.dto';
import { UpdateStockItemDto } from './dto/update-stock-item.dto';
import { CreateStockLocationDto } from './dto/create-stockLocation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockLocation } from 'src/schemas/stockLocation.schema';
import { StockItem, StockStatus } from 'src/schemas/stockItem.schema';
import { types } from 'util';
import { UpdateStockLocationDto } from './dto/update-stockLocation';
import { SearchStockItemDto } from './dto/search-stock-item.dto';
import exp from 'constants';
import { Sale } from 'src/schemas/sale.schema';
import { Purchase } from 'src/schemas/purchase.schema';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { ItemMaster } from 'src/schemas/item-master.schema';
import { createDeflate } from 'zlib';
import { StockItemHistory } from 'src/schemas/stockItemHistory.schema';
import { purchaseItemSchema } from 'src/schemas/purchaseItem.schema';
import { searchStockOnHoldDto } from './dto/search-stockOnHold.dto';
import { PipelineStage } from 'mongoose';


@Injectable()
export class StockItemsService {

  constructor(
    @InjectModel('StockItem') private readonly stockItemModel: Model<StockItem>,
    @InjectModel('StockLocation') private readonly stockLocationModel: Model<StockLocation>,
    @InjectModel('StockItemHistory') private readonly stockItemHistoryModel: Model<StockItemHistory>,
    @InjectModel('ItemMaster') private readonly itemMasterModel: Model<ItemMaster>
  ) { }


  async findAvailableStock(query?: SearchStockItemDto, companyId?: string) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 0;

    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (search) {
      const regexSearch = { $regex: new RegExp(search, 'i') };
      filter.$or = [
        { name: regexSearch },
        { 'itemMaster.vendorName': regexSearch },
        { 'itemMaster.filterName': regexSearch }
      ];
    }

    const today = new Date();

    const stockItems = await this.stockItemModel.aggregate(
      [
        {
          $lookup: {
            from: 'itemmasters',
            localField: 'itemMasterId',
            foreignField: '_id',
            as: 'itemMaster',
          },
        },
        {
          $unwind: {
            path: '$itemMaster',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'packs',
            localField: 'itemMaster.packId',
            foreignField: '_id',
            as: 'pack',
          },
        },
        {
          $unwind: {
            path: '$pack',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            ...filter,
            expiryDate: { $gt: today },
          },
        },
        {
          $lookup: {
            from: 'vendors',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        {
          $project: {
            productName: '$name',
            itemMasterId: 1,
            filterName: '$itemMaster.filterName',
            vendorName: '$vendor.name',
            dosage: '$itemMaster.dosage',
            manufacturerId: '$itemMaster.manufacturerId',
            manufacturerName: '$itemMaster.manufacturerName',
            quantity: 1,
            expiryDate: 1,
            status: 1,
            salePrice: 1,
            mrp: 1,
            hsn: '$itemMaster.hsn',
            sgst: 1,
            cgst: 1,
            igst: 1,
            batch: 1,
            unitRate: 1,
            reorderLevel: '$itemMaster.reorderLevel',
            locationName: 1,
            boxNumber: 1,
            purchasedOn: 1,
            packQty: '$pack.quantity',
            packName: '$pack.name',
          },
        },
        {
          $sort: {
            // quantity: -1,
            expiryDate: 1,
            // _id:1
          },
        },
        {
          $addFields: {
            sortField: {
              $cond: { if: { $eq: ["$quantity", 0] }, then: 1, else: 0 }
            }
          }
        },
        {
          $sort: {
            sortField: 1,
            // _id: 1 
          }
        },
        {
          $project: {
            sortField: 0
          }
        },
        {
          $facet: {
            totalCount: [{ $count: 'count' }],
            data: [
              { $skip: (page - 1) * limit },
              ...(limit > 0 ? [{ $limit: limit }] : []),
            ],
          },
        },
      ]
    )


    const totalCount = stockItems[0].totalCount.length > 0 ? stockItems[0].totalCount[0].count : 0;

    return {
      stockItems: stockItems[0].data,
      totalCount: totalCount,
    };
  }




  async findAll(query?: SearchStockItemDto, companyId?: string) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (query?.date === 'expired') {
      filter.status = StockStatus.Expired;
    } else if (query?.date) {
      const date = new Date(query.date);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      lastDate.setHours(23, 59, 59, 999);
      filter.expiryDate = {
        $gte: startDate,
        $lte: lastDate,
      };
    }

    if (search) {
      const regexSearch = { $regex: new RegExp(search, 'i') };
      filter.$or = [
        { name: regexSearch },
        { 'itemMaster.vendorName': regexSearch },
        { 'itemMaster.filterName': regexSearch }
      ];
    }

    const stockItems = await this.stockItemModel.aggregate([
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster',
        },
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack',
        },
      },
      {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      {
        $project: {
          productName: '$name',
          itemMasterId: 1,
          filterName: '$itemMaster.filterName',
          vendorName: '$vendor.name',
          dosage: '$itemMaster.dosage',
          manufacturerId: '$itemMaster.manufacturerId',
          manufacturerName: '$itemMaster.manufacturerName',
          quantity: 1,
          expiryDate: 1,
          status: 1,
          salePrice: 1,
          mrp: 1,
          unitRate: 1,
          hsn: '$itemMaster.hsn',
          sgst: 1,
          cgst: 1,
          igst: 1,
          batch: 1,
          reorderLevel: '$itemMaster.reorderLevel',
          locationName: 1,
          boxNumber: 1,
          purchasedOn: 1,
          packQty: '$pack.quantity',
          packName: '$pack.name'
        },
      },
      { $sort: { expiryDate: 1 } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalCount = stockItems[0].totalCount.length > 0 ? stockItems[0].totalCount[0].count : 0;
    console.log(stockItems)
    return {
      stockItems: stockItems[0].data,
      totalCount: totalCount,
    };
  }

  async findAllByMasterId(id?: string, query?: SearchStockItemDto) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: any = { itemMasterId: new Types.ObjectId(id) };

    if (search) {
      const regexSearch = { $regex: new RegExp(search, 'i') };
      filter.$or = [
        { name: regexSearch },
        { 'itemMaster.vendorName': regexSearch },
        { 'itemMaster.manufacturerName': regexSearch }
      ];
    }

    const stockItems = await this.stockItemModel.aggregate([
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster',
        },
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack',
        },
      },
      {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      {
        $project: {
          productName: '$name',
          vendorName: '$vendor.name',
          manufacturerId: '$itemMaster.manufacturerId',
          manufacturerName: '$itemMaster.manufacturerName',
          quantity: 1,
          expiryDate: 1,
          batch: 1,
          reorderLevel: '$itemMaster.reorderLevel',
          locationId: 1,
          locationName: 1,
          boxNumber: 1,
          createdAt: '$createdAt',
          updatedAt: '$updatedAt',
          mrp: 1,
          unitRate: 1,
          purchasedOn: 1,
          packQty: '$pack.quantity',
          packName: '$pack.name'
        },
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalCount = stockItems[0].totalCount.length > 0 ? stockItems[0].totalCount[0].count : 0;
    console.log(stockItems)
    return {
      stockItems: stockItems[0].data,
      totalCount: totalCount,
    };
  }

  // stock on hold

  async stockOnHoldLast60Days(query?: searchStockOnHoldDto,companyId?:string) {
    // console.log(query)
    // Get the current date
    const currentDate = new Date();

    // Get the date 60 days before the current date
    const pastDate = new Date();
    pastDate.setDate(currentDate.getDate() - 60);

    // Format the dates
    const formattedCurrentDate = this.formatDate(currentDate);
    const formattedPastDate = this.formatDate(pastDate);
    // console.log(formattedCurrentDate)
    // console.log(formattedPastDate)

    return await this.stockOnHold(formattedPastDate, formattedCurrentDate, query.page, query.limit,companyId)
  }

  async stockOnHold(startDate, endDate, pg, lim,companyId:string) {

    console.log('startDate - ', startDate)
    console.log('endDate - ', endDate)
    const page = Number(pg) || 1
    const limit = Number(lim) || 1
    // console.log(typeof(page),limit,'-')
    const aggregation: any[] = [
      {
        $match: {
          quantity: { $ne: 0 },
          companyId:new Types.ObjectId(companyId)
        }
      },
      {
        $lookup: {
          from: "saleitems",
          let: {
            itemMasterId: "$_id",
            startDate: new Date(
              startDate
            ),
            endDate: new Date(
              endDate
            )
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        "$itemMasterId",
                        "$$itemMasterId"
                      ]
                    },
                    {
                      $gte: [
                        "$createdAt",
                        "$$startDate"
                      ]
                    },
                    {
                      $lt: ["$createdAt", "$$endDate"]
                    }
                  ]
                }
              }
            }
          ],
          as: "sales"
        }
      },
      {
        $match: {
          sales: []
        }
      },
      {
        $lookup: {
          from: "stockitems",
          localField: "_id",
          foreignField: "itemMasterId",
          as: "stocks"
        }
      },
      {
        $addFields: {
          oldestStockExpiryDate: {
            $min: "$stocks.expiryDate"
          }
        }
      },
      {
        $addFields: {
          oldestStock: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$stocks",
                  cond: {
                    $eq: [
                      "$$this.expiryDate",
                      "$oldestStockExpiryDate"
                    ]
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          name: 1,
          vendorName: 1,
          quantity: 1,
          expiryDate: "$oldestStockExpiryDate",
          status: "$oldestStock.status",
          batch: "$oldestStock.batch"
        }
      },
      {
        $sort: { expiryDate: 1 }
      },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ]
        }
      }
    ]


    const data = await this.itemMasterModel.aggregate(aggregation)
    // console.log(data)
    const totalCount = data[0].totalCount.length > 0 ? data[0].totalCount[0].count : 0;
    try {
      return {
        data: data[0].data,
        totalCount: totalCount
      }
    }
    catch {
      return {}
    }
  }


  async countStockItems(companyId?: string) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Calculate start and end dates for the next four months
    const nextMonthStartDate = new Date(
      Date.UTC(currentYear, currentMonth + 1, 1)
    );
    const nextMonthEndDate = new Date(
      Date.UTC(currentYear, currentMonth + 2, 0, 23, 59, 59, 999)
    );

    const secondMonthStartDate = new Date(
      Date.UTC(currentYear, currentMonth + 2, 1)
    );
    const secondMonthEndDate = new Date(
      Date.UTC(currentYear, currentMonth + 3, 0, 23, 59, 59, 999)
    );

    const thirdMonthStartDate = new Date(
      Date.UTC(currentYear, currentMonth + 3, 1)
    );
    const thirdMonthEndDate = new Date(
      Date.UTC(currentYear, currentMonth + 4, 0, 23, 59, 59, 999)
    );


    const nextMonthName = nextMonthStartDate.toLocaleString('en-us', {
      month: 'short'
    });
    const secondMonthName = secondMonthStartDate.toLocaleString('en-us', {
      month: 'short'
    });
    const thirdMonthName = thirdMonthStartDate.toLocaleString('en-us', {
      month: 'short'
    });

    const counts = await this.stockItemModel.aggregate([
      {
        $match: { companyId: new Types.ObjectId(companyId) }
      },
      {
        $group: {
          _id: null,
          nextMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$expiryDate', nextMonthStartDate] },
                    { $lte: ['$expiryDate', nextMonthEndDate] }
                  ]
                },
                1,
                0
              ]
            }
          },
          secondMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$expiryDate', secondMonthStartDate] },
                    { $lte: ['$expiryDate', secondMonthEndDate] }
                  ]
                },
                1,
                0
              ]
            }
          },
          thirdMonth: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$expiryDate', thirdMonthStartDate] },
                    { $lte: ['$expiryDate', thirdMonthEndDate] }
                  ]
                },
                1,
                0
              ]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $lt: ['$expiryDate', currentDate] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          nextMonth: {
            name: nextMonthName,
            count: '$nextMonth',
            date: nextMonthStartDate
          },
          secondMonth: {
            name: secondMonthName,
            count: '$secondMonth',
            date: secondMonthStartDate
          },
          thirdMonth: {
            name: thirdMonthName,
            count: '$thirdMonth',
            date: thirdMonthStartDate
          },
          expired: { count: '$expired', date: 'expired' }
        }
      }
    ]);

    if (!counts[0]) {
      return {
        counts: {
          nextMonth: {
            name: nextMonthName,
            count: 0,
            date: nextMonthStartDate
          },
          secondMonth: {
            name: secondMonthName,
            count: 0,
            date: secondMonthStartDate
          },
          thirdMonth: {
            name: thirdMonthName,
            count: 0,
            date: thirdMonthStartDate
          },
          expired: {
            count: 0,
            date: 'expired'
          }
        },
        status: 'success'
      };
    }

    return {
      counts: counts[0],
      status: 'success'
    };
  }

  //stock location

  async createStockLocation(createStockLocationDto?: CreateStockLocationDto, userId?: string, companyId?: string) {
    const stockLocation = await this.stockLocationModel.findOne({ name: createStockLocationDto.name });
    if (stockLocation) {
      return { message: 'Stock location already exists' };
    }
    console.log(createStockLocationDto);

    const newStockLocation = new this.stockLocationModel(createStockLocationDto);
    newStockLocation.createdBy = new Types.ObjectId(userId);
    newStockLocation.updatedBy = new Types.ObjectId(userId);
    newStockLocation.ownedBy = new Types.ObjectId(userId);
    newStockLocation.companyId = new Types.ObjectId(companyId)

    console.log('New stock location object before save:', newStockLocation);
    await newStockLocation.save();
    console.log(newStockLocation);

    return {
      status: 'success',
      message: 'Stock location created successfully',
      stockLocation: newStockLocation,
    }
  }
  async findAllLocations(companyId?:string) {
    return await this.stockLocationModel.find({companyId:new Types.ObjectId(companyId)}).exec();
  }

  async updateStockLocation(id?: string, updateStockLocationDto?: UpdateStockLocationDto, userId?: string,companyId?:string) {
    const stockLocation = await this.stockLocationModel.findById(id);
    if (!stockLocation) {
      throw new BadRequestException('Stock location not found');
    }
    if(stockLocation.name !== updateStockLocationDto.name){
      const existingStockLocation  = await this.stockLocationModel.findOne({name:updateStockLocationDto.name,companyId:new Types.ObjectId(companyId)}).exec()
      if(existingStockLocation){
        throw new BadRequestException('Stock location already exists');
      }
    }
    stockLocation.name = updateStockLocationDto.name;
    stockLocation.updatedBy = new Types.ObjectId(userId);
    const newStockLocation = await stockLocation.save();
    return {
      status: 'success',
      message: 'Stock location updated successfully',
      stockLocation: newStockLocation,
    }

  }


  async findByStockId(id: string) {
    const stock = await this.stockItemModel.findById(id);
    if (!stock) {
      throw new BadRequestException('Stock not found');
    }

    const stockItems = await this.stockItemModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster',
        },
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack',
        },
      },
      {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          itemMasterId: 1,
          locationId: 1,
          locationName: 1,
          boxNumber: 1,
          vendorName: '$itemMaster.vendorName',
          name: 1,
          filterName: '$itemMaster.filterName',
          sgst: 1,
          cgst: 1,
          igst: 1,
          quantity: 1,
          salePrice: 1,
          mrp: 1,
          batch: 1,
          expiryDate: 1,
          unitRate: 1,
          createdBy: 1,
          updatedBy: 1,
          ownedBy: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          isUsed: 1,
          purchasedOn: 1,
          reorderLevel: '$itemMaster.reorderLevel',
          packQty: '$pack.quantity',
          packName: '$pack.name'
        },
      },
    ]).exec();

    return stockItems[0];
  }

  async updateStockItem(id?: string, updateStockItemDto?: UpdateStockItemDto, userId?: string) {
    const stockItem = await this.stockItemModel.findById(id);
    if (!stockItem) {
      throw new BadRequestException('Stock item not found');
    }
    if (updateStockItemDto.locationId) {
      const location = await this.stockLocationModel.findById(updateStockItemDto.locationId);
      if (!location) {
        throw new BadRequestException('Location not found');
      }
      updateStockItemDto.locationId = location._id;
      updateStockItemDto.locationName = location.name;
    }
    if (updateStockItemDto.filterName) {
      const ItemMaster = await this.itemMasterModel.findOne({ _id: stockItem.itemMasterId });
      if (ItemMaster) {
        const updateName = await this.itemMasterModel.findOneAndUpdate(
          { _id: stockItem.itemMasterId },
          { filterName: updateStockItemDto.filterName, updatedBy: new Types.ObjectId(userId) },
          { new: true }
        );
      }
    }
    if (updateStockItemDto?.quantity != stockItem.quantity) {
      await this.createStockHistory(stockItem, userId)
    }


    const updatedStockItem = await this.stockItemModel.findByIdAndUpdate(
      id,
      { ...updateStockItemDto, updatedBy: new Types.ObjectId(userId), isUsed: true },

      { new: true }
    );

    const result = await this.stockItemModel.aggregate([
      { $match: { itemMasterId: new Types.ObjectId(stockItem.itemMasterId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);

    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
    const itemMasterQty = await this.itemMasterModel.findByIdAndUpdate(
      stockItem.itemMasterId,
      { quantity: totalQuantity },
      { new: true }
    );


    return {
      status: 'success',
      message: 'Stock item updated successfully',
      stockItem: updatedStockItem,
    }
  }

  async createStockHistory(createStockItemDto?: any, userId?: string) {
    const createStockHistory = await this.stockItemHistoryModel.create({
      stockItemId: createStockItemDto._id,
      itemMasterId: createStockItemDto.itemMasterId,
      name: createStockItemDto.name,
      sgst: createStockItemDto.sgst,
      cgst: createStockItemDto.cgst,
      igst: createStockItemDto.igst,
      quantity: createStockItemDto.quantity,
      locationId: createStockItemDto?.locationId,
      locationName: createStockItemDto?.locationName,
      boxNumber: createStockItemDto.boxNumber,
      mrp: createStockItemDto.mrp,
      salePrice: createStockItemDto.salePrice,
      batch: createStockItemDto.batch,
      expiryDate: createStockItemDto.expiryDate,
      unitRate: createStockItemDto.unitRate,
      status: createStockItemDto.status,
      isUsed: createStockItemDto.isUsed,
      total: createStockItemDto.total,
      stockcreatedBy: createStockItemDto.createdBy,
      stockCreatedAt: createStockItemDto.createdAt,
      purchasedOn: createStockItemDto.purchasedOn,
      companyId:createStockItemDto.companyId,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
      ownedBy: new Types.ObjectId(userId),
    })

    return createStockHistory
  }

  async findAllStockHistory(query?: SearchStockItemDto, companyId?: string) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: any = { companyId: new Types.ObjectId(companyId) };

    if (search) {
      const regexSearch = { $regex: new RegExp(search, 'i') };
      filter.$or = [
        { name: regexSearch },
        { 'itemMaster.vendorName': regexSearch },
        { 'itemMaster.filterName': regexSearch }
      ];
    }

    const stockItems = await this.stockItemHistoryModel.aggregate([
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster',
        },
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack',
        },
      },
      {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $project: {
          productName: '$name',
          filterName: '$itemMaster.filterName',
          vendorName: '$itemMaster.vendorName',
          dosage: '$itemMaster.dosage',
          manufacturerId: '$itemMaster.manufacturerId',
          manufacturerName: '$itemMaster.manufacturerName',
          quantity: 1,
          expiryDate: 1,
          status: 1,
          salePrice: 1,
          hsn: '$itemMaster.hsn',
          sgst: 1,
          cgst: 1,
          igst: 1,
          batch: 1,
          reorderLevel: '$itemMaster.reorderLevel',
          locationName: 1,
          boxNumber: 1,
          stockcreatedBy: 1,
          stockCreatedAt: 1,
          stockItemId: 1,
          mrp: 1,
          unitRate: 1,
          packQty: '$pack.quantity',
          packName: '$pack.name'
        },
      },
      { $sort: { expiryDate: 1 } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalCount = stockItems[0].totalCount.length > 0 ? stockItems[0].totalCount[0].count : 0;

    return {
      stockItems: stockItems[0].data,
      totalCount: totalCount,
    };
  }

  async findAllStockHistoryBymasterId(id?: string, query?: SearchStockItemDto) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const filter: any = { itemMasterId: new Types.ObjectId(id) };
    if (search) {
      const regexSearch = { $regex: new RegExp(search, 'i') };
      filter.$or = [
        { name: regexSearch },
        { 'itemMaster.vendorName': regexSearch },
        { 'itemMaster.filterName': regexSearch }
      ];
    }

    const stockItems = await this.stockItemHistoryModel.aggregate([
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster',
        },
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack',
        },
      },
      {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: filter,
      },
      {
        $project: {
          productName: '$name',
          filterName: '$itemMaster.filterName',
          vendorName: '$itemMaster.vendorName',
          dosage: '$itemMaster.dosage',
          itemMasterId: 1,
          manufacturerId: '$itemMaster.manufacturerId',
          manufacturerName: '$itemMaster.manufacturerName',
          quantity: 1,
          expiryDate: 1,
          status: 1,
          salePrice: 1,
          hsn: '$itemMaster.hsn',
          sgst: 1,
          cgst: 1,
          igst: 1,
          batch: 1,
          reorderLevel: '$itemMaster.reorderLevel',
          locationName: 1,
          boxNumber: 1,
          stockcreatedBy: 1,
          stockCreatedAt: 1,
          stockItemId: 1,
          mrp: 1,
          unitRate: 1,
          packQty: '$pack.quantity',
          packName: '$pack.name'
        },
      },
      { $sort: { expiryDate: 1 } },
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ]).exec();

    const totalCount = stockItems[0].totalCount.length > 0 ? stockItems[0].totalCount[0].count : 0;

    return {
      stockItems: stockItems[0].data,
      totalCount: totalCount,
    };
  }

  formatDate(date) {
    return date.toISOString().split('.')[0] + 'Z';
  }



  // db fix for stock item to add vendor id from item master id

  async dbFix() {
    const data = await this.stockItemModel.find().exec();
    console.log(data.length)
    let count = 0
    for (const item of data) {
      console.log('---')
      const itemMaster = await this.itemMasterModel.findById(item.itemMasterId)
      if (!itemMaster) console.log('no item Master!')
      await this.stockItemModel.updateOne({ _id: item._id }, { $set: { vendorId: itemMaster['vendorId'] } })
      console.log(itemMaster['vendorId'])
      count++
      // console.log('---')
    }

    console.log(count)
  }

}






