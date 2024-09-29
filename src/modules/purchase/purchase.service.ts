import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDetailsDto, UpdatePurchaseDto } from './dto/update-purchase.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types, isValidObjectId } from 'mongoose';
import { Manufacturer } from 'src/schemas/manufacturer.schema';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { Purchase } from 'src/schemas/purchase.schema';
import { PurchaseItem } from 'src/schemas/purchaseItem.schema';
import { ItemMaster } from 'src/schemas/item-master.schema';
import { Vendor } from 'src/schemas/vendor.schema';
import { CreateItemMasterDto } from './dto/create-itemmaster.dto';
import { PurchaseItemDto } from './dto/create-purchaseItem.dto';
import { StockItem } from 'src/schemas/stockItem.schema';
import { Pack } from 'src/schemas/pack.schema';
import { SearchPurchaseDto } from './dto/search-purchase.dto';
import { SearchItemMasterDto } from './dto/search-itemMaster.dto';
import { CreatePurchaseReturnDto } from './dto/create-purchaseReturn.dto';
import { PurchaseReturn } from 'src/schemas/purchaseReturn.schema';
import { PurchaseReturnItem } from 'src/schemas/purchaseReturnItem.schema';
import { CreatePurchaseReturnItemDto } from './dto/create-purchaseReturnItem.dto';
import { IdService } from '../common/services/id.service';


@Injectable()
export class PurchaseService {

  constructor(
    @InjectModel('Purchase') private readonly purchaseModel: Model<Purchase>,
    @InjectModel('PurchaseItem') private readonly purchaseItemModel: Model<PurchaseItem>,
    @InjectModel('PurchaseReturn') private readonly purchaseReturnModel: Model<PurchaseReturn>,
    @InjectModel('PurchaseReturnItem') private readonly purchaseReturnItemModel: Model<PurchaseReturnItem>,
    @InjectModel('Manufacturer') private readonly manufacturerModel: Model<Manufacturer>,
    @InjectModel('ItemMaster') private readonly itemMasterModel: Model<ItemMaster>,
    @InjectModel('Vendor') private readonly vendorModel: Model<Vendor>,
    @InjectModel('StockItem') private readonly stockItemModel: Model<StockItem>,
    @InjectModel('Pack') private readonly packModel: Model<Pack>,

    @InjectConnection() private readonly connection: Connection,

    private readonly idService: IdService,
  ) { }


  //purchase


  async create(createPurchaseDto?: CreatePurchaseDto, userId?: string,companyId?:string) {
    let purchase;

    if (!createPurchaseDto.purchaseId && createPurchaseDto.invoiceNumber) {
      createPurchaseDto.invoiceNumber = createPurchaseDto.invoiceNumber.trim();
      const existingPurchase = await this.purchaseModel.findOne({ invoiceNumber: createPurchaseDto.invoiceNumber, 'vendorDetails.vendorId': new Types.ObjectId(createPurchaseDto.vendorId),companyId:new Types.ObjectId(companyId) });
      if (existingPurchase) {
        throw new BadRequestException('Invoice Number already exists');
      }
    }

    if (createPurchaseDto.purchaseId) {
      purchase = await this.purchaseModel.findById(createPurchaseDto.purchaseId);
      if (!purchase) throw new BadRequestException('Purchase not found');

    } else {

      const vendor = await this.vendorModel.findById(createPurchaseDto.vendorId);
      if (!vendor) throw new BadRequestException('Company not found');
      let vendorDetails = {
        vendorId: vendor._id,
        vendorName: vendor.name,
        place: vendor.location,
        state: vendor.state,
        gstNo: vendor.gstNo
      };

      purchase = await this.purchaseModel.create({
        ...createPurchaseDto,
        invoiceNumber: createPurchaseDto.invoiceNumber.trim(),
        uniqueCode: await this.idService.generateId('PURCHASE',new Types.ObjectId(companyId)),
        vendorDetails: vendorDetails,
        companyId:new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId)
      });
    }


    return {
      status: 'success',
      message: 'Purchase created successfully',
      purchase: purchase,
    };
  }

  async createItemMaster(createItemMasterDto?: CreateItemMasterDto, userId?: string,companyId?:string) {

    let itemMaster;

    if (createItemMasterDto.itemMasterId && isValidObjectId(createItemMasterDto.itemMasterId)) {
      itemMaster = await this.itemMasterModel.findById(createItemMasterDto.itemMasterId);
      if (!itemMaster) throw new BadRequestException('ItemMaster not found');
    } else {
      const existingItemMaster = await this.itemMasterModel.findOne({ name: createItemMasterDto.name,companyId:new Types.ObjectId(companyId) });
      if (existingItemMaster) {
        throw new BadRequestException('ItemMaster already exists');
      }
      const pack = await this.packModel.findOne({packId:new Types.ObjectId(createItemMasterDto.packId),companyId:new Types.ObjectId(companyId)});
      if (!pack) {
        throw new BadRequestException('Pack not found');
      }
      const manufacture = await this.manufacturerModel.findOne({manufacturerId:createItemMasterDto.manufacturerId,companyId:new Types.ObjectId(companyId)});
      if (!manufacture) {
        throw new BadRequestException('Manufacture not found');
      }

      const vendor = await this.vendorModel.findOne({vendorId:createItemMasterDto.vendorId,companyId:new Types.ObjectId(companyId)});
      if (!vendor) {
        throw new BadRequestException('Vendor not found');
      }

      itemMaster = await this.itemMasterModel.create({
        ...createItemMasterDto,
        vendorId: vendor._id,
        vendorName: vendor?.name,
        manufactureId: manufacture?._id,
        manufacturerName: manufacture?.name,
        packId: pack?._id,
        packName: pack?.name,
        companyId:new Types.ObjectId(companyId),
        updatedBy: new Types.ObjectId(userId),
        createdBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId)
      });

    }

    return {
      status: 'success',
      message: 'Product created successfully',
      itemMaster: itemMaster,
    };
  }


  async createPurchaseItem(createPurchaseItemDto?: PurchaseItemDto, userId?: string,companyId?:string) {

    let stock, igst = 0, cgst = 0, sgst = 0
    if (createPurchaseItemDto.cgst != 0) {
      cgst = createPurchaseItemDto.cgst / 100;
    }
    if (createPurchaseItemDto.igst != 0) {
      igst = createPurchaseItemDto.igst / 100;
    }
    if (createPurchaseItemDto.sgst != 0) {
      sgst = createPurchaseItemDto.sgst / 100;
    }



    const purchase = await this.purchaseModel.findById(createPurchaseItemDto.purchaseId);
    if (!purchase) throw new BadRequestException('Purchase not found');

    const quantity = createPurchaseItemDto.purchaseQuantity + createPurchaseItemDto.freeQuantity;

    const igstValue = igst * createPurchaseItemDto.purchaseRate * quantity;
    const cgstValue = cgst * createPurchaseItemDto.purchaseRate * quantity;
    const sgstValue = sgst * createPurchaseItemDto.purchaseRate * quantity;

    const itemMaster = await this.itemMasterModel.findById(createPurchaseItemDto?.itemMasterId);
    const pack = await this.packModel.findById(itemMaster?.packId);
    if (!pack) throw new BadRequestException('Pack not found')
    if (!itemMaster) throw new BadRequestException('Product not found');

    try {

      const purchaseItem = await this.purchaseItemModel.create({
        ...createPurchaseItemDto,
        itemMasterId: itemMaster._id,
        itemMasterName: itemMaster.name,
        packQuantity: pack.quantity,
        packId: pack._id,
        purchaseId: new Types.ObjectId(createPurchaseItemDto.purchaseId),
        quantity: quantity,
        igstValue: igstValue,
        cgstValue: cgstValue,
        sgstValue: sgstValue,
        companyId:new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId)
      });

      if (purchaseItem) {
        stock = await this.addStockItem(purchaseItem);
      }
      return {
        status: 'success',
        message: 'Item added successfully',
        stock: stock
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async addStockItem(purchaseItem: any) {
    console.log('add stock item function')
    let stock, itemMaster;

    const item = await this.purchaseItemModel.findOne({ _id: purchaseItem._id });
    if (!item) throw new BadRequestException('Purhcase Item not found');

    const purchase = await this.purchaseModel.findById(item.purchaseId)
    const newQuantity = purchaseItem.quantity * item.packQuantity;

    const startOfDay = new Date(item.expiryDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(item.expiryDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    try {
      const existingStock = await this.stockItemModel.findOne({
        itemMasterId: item.itemMasterId,
        mrp: item.mrp,
        expiryDate: { $gte: startOfDay, $lte: endOfDay },
        companyId:new Types.ObjectId(purchase.companyId)
      });
      if (existingStock) {
        stock = await this.stockItemModel.findOneAndUpdate(
          { _id: existingStock._id },
          {
            $inc: { quantity: newQuantity },
            $set: { updatedBy: new Types.ObjectId(item.updatedBy) }
          },
          { new: true }
        );
      } else {
        stock = await this.stockItemModel.create({
          itemMasterId: item.itemMasterId,
          vendorId:purchase.vendorDetails.vendorId,
          name: item.itemMasterName,
          sgst: item.sgst,
          cgst: item.cgst,
          igst: item.igst,
          quantity: newQuantity,
          salePrice: item.salePrice,
          mrp: item.mrp,
          batch: item.batch,
          expiryDate: item.expiryDate,
          unitRate: item.unitRate,
          total: item.total,
          purchasedOn: purchase.invoiceDate,
          companyId:new Types.ObjectId(purchase.companyId),
          createdBy: new Types.ObjectId(item.createdBy),
          updatedBy: new Types.ObjectId(item.updatedBy),
          ownedBy: new Types.ObjectId(item.ownedBy)
        });
      }
      const purchaseItems = await this.purchaseItemModel.findByIdAndUpdate(item._id, { stockId: stock._id }, { new: true });
      await this.updateBatchCount(stock.itemMasterId);

      const result = await this.stockItemModel.aggregate([
        { $match: { itemMasterId: new Types.ObjectId(stock.itemMasterId) } },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
      ]);

      const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
      itemMaster = await this.itemMasterModel.findByIdAndUpdate(
        stock.itemMasterId,
        { quantity: totalQuantity },
        { new: true }
      );


      return {
        status: 'success',
        message: 'Stock added successfully',
        stock: stock,
        purchaseItem: purchaseItems,
        itemMaster: itemMaster
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updatePurchase(id?: string, updatePurchaseDto?: UpdatePurchaseDetailsDto, userId?: string) {
    const purchase = await this.purchaseModel.findById(id)
    if (!purchase) throw new BadRequestException('Purchase not found')

    try {
      const totalItems = await this.purchaseItemModel.find({ purchaseId: new Types.ObjectId(id) }).countDocuments();


      const updatedPurchase = await this.purchaseModel.findByIdAndUpdate(id,
        {
          ...updatePurchaseDto,
          totalItems: totalItems,
          updatedBy: new Types.ObjectId(userId)
        },
        { new: true });
      return {
        status: 'success',
        message: 'Purchase added successfully',
        purchase: updatedPurchase
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }



  async findMasterProducts(companyId?: string) {
    const itemMaster = await this.itemMasterModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ createdAt: -1 }).exec();
    return itemMaster;
  }




  async findAllPurchaseItems(id?: string, query?: SearchPurchaseDto) {
    const search = query?.search;
    const filter: any = { purchaseId: new Types.ObjectId(id) };

    const purchaseItem = await this.purchaseItemModel.aggregate([
      {
        $match: filter
      },
      {
        $lookup: {
          from: 'itemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemMaster'
        }
      },
      {
        $unwind: {
          path: '$itemMaster',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'packs',
          localField: 'itemMaster.packId',
          foreignField: '_id',
          as: 'pack'
        }
      }, {
        $unwind: {
          path: '$pack',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'stockitems',
          localField: 'stockId',
          foreignField: '_id',
          as: 'stock'
        }
      },
       {
        $unwind: {
          path: '$stock',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          itemMasterId: 1,
          itemMasterName: 1,
          packQty: '$pack.quantity',
          stockQty: '$stock.quantity',
          purchaseId: 1,
          sgst: 1,
          sgstValue: 1,
          cgst: 1,
          cgstValue: 1,
          igst: 1,
          igstValue: 1,
          stockId: 1,
          purchaseQuantity: 1,
          freeQuantity: 1,
          quantity: 1,
          purchaseRate: 1,
          mrp: 1,
          salePrice: 1,
          batch: 1,
          location: 1,
          boxNumber: 1,
          expiryDate: 1,
          unitRate: 1,
          total: 1,
          returnedQty: 1,
          totalItems: 1,
          createdAt: 1,
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    return {
      purchaseItem: purchaseItem
    };
  }



  async findAllPurchase(query?: SearchPurchaseDto,companyId?: string) {

    const search = query.search;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const filter: any = {companyId: new Types.ObjectId(companyId)};
    if (search) {
      filter.$or = 
         [
          { uniqueCode: { $regex: search, $options: 'i' } },
          { invoiceNumber: { $regex: search, $options: 'i' } },
          { 'vendorDetails.vendorName': { $regex: search, $options: 'i' } },
        ]
    } else if (query.date) {
      const startDate = new Date(query.date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(query.date);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.invoiceDate = { $gte: startDate, $lt: endDate };
    }

    const purchases = await this.purchaseModel.aggregate([
      {
        $match: filter
      },
      {
        $project: {
          _id: 1,
          uniqueCode: 1,
          billDate: 1,
          vendorDetails: 1,
          invoiceNumber: 1,
          invoiceDate: 1,
          grossTotal: 1,
          totalItems: 1,
          totalSgst: 1,
          totalCgst: 1,
          totalIgst: 1,
          totalAmount: 1,
          mrpTotal:1,
          cess: 1,
          discount: 1,
          grandTotal: 1,
          paymentMode: 1,
          paymentStatus: 1,
          isActive: 1,
          isDraft: 1,
          createdAt: -1
        }
      }, {
        $sort: {
          createdAt: -1
        }
      },
      {
        $facet: {
          totalData: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])
    const totalCount = purchases[0].totalCount[0] ? purchases[0].totalCount[0].count : 0;

    return {
      purchases: purchases[0].totalData,
      total: totalCount
    };
  }

  async findPurchase(id?: string) {

    const purchase = await this.purchaseModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(id) }
      },
      {
        $project: {
          _id: 1,
          uniqueCode: 1,
          billDate: 1,
          vendorDetails: 1,
          invoiceNumber: 1,
          invoiceDate: 1,
          grossTotal: 1,
          totalSgst: 1,
          totalCgst: 1,
          totalIgst: 1,
          totalAmount: 1,
          cess: 1,
          discount: 1,
          grandTotal: 1,
          paymentMode: 1,
          paymentStatus: 1,
          isActive: 1,
          isDraft: 1
        }
      }
    ])

    return purchase[0];
  }




  async deletePurchaseItem(id?: string, userId?: string) {

    const purchaseItem = await this.purchaseItemModel.findById(id).exec()
    if (!purchaseItem) {
      throw new BadRequestException('Purchase Item not found');
    }
    const stock = await this.reduceStock(purchaseItem.stockId, purchaseItem.packId, purchaseItem.quantity, userId)
    await this.purchaseItemModel.findByIdAndDelete(id).exec();
    return {
      status: 'success',
      message: 'Purchase Item deleted successfully',
      stock: stock
    };

  }

  async reduceStock(id?: any, packId?: any, quantity?: number, userId?: string) {

    const stock = await this.stockItemModel.findById(id).exec();
    if (!stock) {
      throw new BadRequestException('Stock not found');
    }
    const pack = await this.packModel.findById(packId)
    if (!pack) {
      throw new BadRequestException('Pack not found');
    }

    const newQuantity = quantity * pack.quantity;

    const existingStock = await this.stockItemModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      {
        $inc: { quantity: -newQuantity },
        $set: { updatedBy: new Types.ObjectId(userId) }
      },
      { new: true }
    );
    const result = await this.stockItemModel.aggregate([
      { $match: { itemMasterId: new Types.ObjectId(stock.itemMasterId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } },
    ]);

    const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;
    const updatedStock = await this.itemMasterModel.findByIdAndUpdate(
      stock.itemMasterId,
      { quantity: totalQuantity },
      { new: true }
    );
    if (!updatedStock) throw new BadRequestException('Error updating stock');

    if (existingStock.quantity <= 0 && existingStock.isUsed === false) {
      await this.stockItemModel.deleteOne({ _id: id });
      await this.updateBatchCount(stock.itemMasterId);
      return {
        status: 'success',
        message: 'Stock deleted successfully'
      };
    }

    return { updatedStock };
  }

  async updateBatchCount(itemMasterId: any) {
    const batchCount = await this.stockItemModel.countDocuments({ itemMasterId: itemMasterId });
    const count = await this.itemMasterModel.findByIdAndUpdate(itemMasterId, { batchCount: batchCount }, { new: true });
    return count;
  }


  async findMasterProductsList(query?: SearchItemMasterDto,companyId?: string) {
    const search = query?.search;
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const filter: any = {companyId: new Types.ObjectId(companyId)};
    if (search) {
      filter.$or =[
          { name: { $regex: search, $options: 'i' } },
          { batchCount: { $regex: search, $options: 'i' } },
        ]
      
    }
    const itemMasters = await this.itemMasterModel.aggregate([
      {
        $match: filter
      },
      {
        $project: {
          _id: 1,
          name: 1,
          filterName: 1,
          reorderLevel: 1,
          batchCount: 1,
          updatedBy: 1,
          quantity: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }, {
        $sort: {
          createdAt: -1
        }
      }, {
        $facet: {
          totalData: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [{ $count: 'count' }]
        }
      }
    ])
    const totalCount = itemMasters[0].totalCount[0] ? itemMasters[0].totalCount[0].count : 0;

    return {
      itemMasters: itemMasters[0].totalData,
      total: totalCount
    }

  }





  //manufacture

  async createManufacture(createManufacturerDto?: CreateManufacturerDto, userId?: string,companyId?:string) {
    const manufacturer = await this.manufacturerModel.findOne({ name: createManufacturerDto.name, companyId:new Types.ObjectId(companyId) });
    if (manufacturer) {
      throw new BadRequestException('Manufacture already exists');
    }
    const newManufacturer = new this.manufacturerModel({
      ...createManufacturerDto,
      companyId:new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
      ownedBy: new Types.ObjectId(userId)
    });
    newManufacturer.save();

    return {
      status: 'success',
      message: 'Manufacturer created successfully',
      manufacturer: newManufacturer,
    }
  }

  async udpateManufacture(id?: string, updateManufacturerDto?: UpdateManufacturerDto, userId?: string) {
    const manufacturer = await this.manufacturerModel.findById(id);
    if (!manufacturer) {
      throw new BadRequestException('Manufacturer not found');
    }
    if (manufacturer.name !== updateManufacturerDto.name) {
      const existManufacure = await this.manufacturerModel.findOne({ name: updateManufacturerDto?.name, companyId:new Types.ObjectId(manufacturer.companyId) }).exec();
      if (existManufacure) throw new BadRequestException('Manufacturer already exists');
    }

    const updatedManufacturer = await this.manufacturerModel.findByIdAndUpdate(id, { ...updateManufacturerDto, updatedBy: new Types.ObjectId(userId) }, { new: true });
    return {
      status: 'success',
      message: 'Manufacturer updated successfully',
      manufacturer: updatedManufacturer,
    }
  }

  async findAllManufacture(companyId?: string ) {
    const manufacturer = (await this.manufacturerModel.find({ companyId: new Types.ObjectId(companyId) }).sort({ createdAt: -1 }));
    return manufacturer
  }

  async findOneManufacture(id: string) {
    const manufacturer = await this.manufacturerModel.findById(id);
    return manufacturer
  }

  async deleteManufacture(id: string) {
    const manufacturer = await this.manufacturerModel.findById(id);
    if (!manufacturer) {
      throw new BadRequestException('Manufacturer not found');
    }
    await this.manufacturerModel.findByIdAndDelete(id);
    return {
      status: 'success',
      message: 'Manufacturer deleted successfully',
    }
  }

  async updatedPurchasedOn() {
    const stockItems = await this.stockItemModel.find();
    if (stockItems.length > 0) {
      for (const stockItem of stockItems) {
        const purchaseItem = await this.purchaseItemModel
          .findOne({ stockId: new Types.ObjectId(stockItem._id) })
          .sort({ createdAt: -1 })
          .exec();

        if (purchaseItem) {
          const purchase = await this.purchaseModel
            .findOne({ _id: new Types.ObjectId(purchaseItem.purchaseId) })
            .exec();

          if (purchase && purchase.invoiceDate) {
            await this.stockItemModel.findByIdAndUpdate(
              stockItem._id,
              { purchasedOn: purchase.invoiceDate },
              { new: true }
            ).exec();
          }
        }
      }
    }

  }

  async invoiceNumberByvendorId(vendorId?: string,companyId?: string) {
    if (!isValidObjectId(vendorId)) {
      throw new BadRequestException('Vendor Id is not Valid');
    }
    const vendor = await this.vendorModel.findById(new Types.ObjectId(vendorId)).exec();
    if (!vendor) throw new BadRequestException('Venodr not found')
    let vendorList = await this.purchaseModel.find({ 'vendorDetails.vendorId': vendor._id,companyId:new Types.ObjectId(companyId) }).select({ invoiceNumber: 1, _id: 1 }).exec();
    return vendorList
  }

  async findOnePurchaseBill(code?: string, invoiceNumber?: string, vendorId?: string,companyId?: string) {
    let purchase;
    if (code) {
      purchase = await this.purchaseModel.findOne({ uniqueCode: code,companyId:new Types.ObjectId(companyId) }).exec()

    } else {
      purchase = await this.purchaseModel.findOne({ invoiceNumber: invoiceNumber, 'vendorDetails.vendorId': vendorId,companyId:new Types.ObjectId(companyId) }).exec();

    }
    return purchase
  }





  ///create purchase return

  async createPurchaseReturn(createPurchaseReturnDto?: CreatePurchaseReturnDto, userId?: string,companyId?:string) {
    let purchaseReturn, purchasereturnItems, vendorDetails;
    const purchase = await this.purchaseModel.findById(createPurchaseReturnDto.purchaseId)
    if (!purchase) throw new BadRequestException('Purchase bill not found')
    if (createPurchaseReturnDto.vendorId) {
      vendorDetails = {
        vendorId: purchase.vendorDetails.vendorId,
        vendorName: purchase.vendorDetails.vendorName,
        place: purchase.vendorDetails.place,
        state: purchase.vendorDetails.state,
        gstNo: purchase.vendorDetails.gstNo
      }
    }
    try {
      purchaseReturn = await this.purchaseReturnModel.create({
        ...createPurchaseReturnDto,
        purchaseId: purchase._id,
        uniqueCode: await this.idService.generateId('PURCHASE_RETURN',new Types.ObjectId(companyId)),
        vendorDetails: vendorDetails,
        companyId:new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId),
      })
      purchasereturnItems = await this.createPurchaseReturnItem(createPurchaseReturnDto.purchaseReturnItems, purchaseReturn._id, userId)
      return {
        status: 'success',
        message: 'Purchase return created successfully',
        purchaseReturn: purchaseReturn,
        purchasereturnItem: purchasereturnItems
      }
    } catch (e) {
      console.log(e)
      throw new BadRequestException(e.message);
    }

  }

  async createPurchaseReturnItem(purchaseReturnItems?: CreatePurchaseReturnItemDto[], purchaseReturnId?: string, userId?: string) {
    if (!purchaseReturnId && isValidObjectId(purchaseReturnId)) throw new BadRequestException('Purchase return not found')
    const createdPurchaseReturnItems = [];

    for (const item of purchaseReturnItems) {
      let itemMaster, pack;
      if (item.itemMasterId) {
        itemMaster = await this.itemMasterModel.findById(item.itemMasterId);
        if (!itemMaster) throw new BadRequestException('Item master not found');
        pack = await this.packModel.findById(itemMaster.packId)
        if (!pack) throw new BadRequestException('Pack not found')
      }

      const existingStock = await this.stockItemModel.findById(item.stockId)
      if (existingStock.quantity < item.returnQty) throw new BadRequestException(`Insufficent stock, only ${existingStock.quantity} available`)

      const purchaseReturnItem = await this.purchaseReturnItemModel.create({
        ...item,
        purchaseReturnId: purchaseReturnId,
        itemMasterId: itemMaster?._id,
        itemMasterName: itemMaster?.name,
        purchaseItemId: new Types.ObjectId(item.purchaseItemId),
        packId: new Types.ObjectId(itemMaster?.packId),
        stockId: new Types.ObjectId(item.stockId),
        companyId:new Types.ObjectId(itemMaster?.companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId),
      });


      const stock = await this.stockItemModel.findById(purchaseReturnItem.stockId)
      if (!stock) throw new BadRequestException('Stock not found');

      if (stock.quantity >= purchaseReturnItem.returnQty) {
        const newQuantity = stock.quantity - purchaseReturnItem.returnQty;
        const updatedStock = await this.stockItemModel.findByIdAndUpdate(purchaseReturnItem.stockId, { quantity: newQuantity }, { new: true });
        if (!updatedStock) throw new BadRequestException('Stock update failed')
      }

      createdPurchaseReturnItems.push({
        purchaseReturnItem: purchaseReturnItem,
        stock: stock
      });

      const stockAggregation = await this.stockItemModel.aggregate([
        {
          $match: { itemMasterId: new Types.ObjectId(item.itemMasterId) },
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantity" },
          },
        },
      ]).exec();

      const totalQuantity = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

      const updateQtyItemMaster = await this.itemMasterModel.findByIdAndUpdate(item.itemMasterId,
        { $set: { quantity: totalQuantity, updatedBy: new Types.ObjectId(userId) } },
        { new: true })

      if (item.purchaseItemId) {
        const result = await this.purchaseReturnItemModel.aggregate([
          { $match: { purchaseItemId: new Types.ObjectId(item.purchaseItemId) } },
          { $group: { _id: null, totalQuantity: { $sum: '$returnQty' } } },
        ]);
        const totalQuantity = result.length > 0 ? result[0].totalQuantity : 0;

        const updateReturnedQty = await this.purchaseItemModel.findByIdAndUpdate(
          item.purchaseItemId,
          { returnedQty: totalQuantity },
          { new: true }
        );
      }
    }
  }

  async listPurchaseReturn(query?: SearchPurchaseDto,companyId?: string) {
    const search = query?.search;
    const page = query?.page;
    const date = query?.date;
    const limit = query?.limit || 10;

    const filter: any = {companyId: new Types.ObjectId(companyId)}
    if (search) {
      filter.$or = [
        { uniqueCode: { $regex: search, $options: 'i' } },
        { purchaseBillNumber: { $regex: search, $options: 'i' } }
      ];
    } else if (date) {
      const startDate = new Date(date);
      startDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setUTCHours(23, 59, 59, 999);
      filter.billDate = { $gte: startDate, $lte: endDate };

    }

    const purchaseReturn = await this.purchaseReturnModel.find({ ...filter }).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }).exec();
    const total = await this.purchaseReturnModel.countDocuments({ ...filter }).exec();

    return {
      purchaseReturn: purchaseReturn,
      total: total
    }

  }

  async listPurchaseReturnItem(id?: string) {
    const purchaseReturn = await this.purchaseReturnModel.findById(id).exec();
    if (!purchaseReturn) {
      throw new BadRequestException('Purchase return not found');
    }
    const purchaseReturnItems = await this.purchaseReturnItemModel.find({ purchaseReturnId: purchaseReturn._id }).exec();
    return purchaseReturnItems;
  }


  async getPurchaseReturn(id: string) {
    const purchaseReturn = await this.purchaseReturnModel.findById(id).exec();
    return purchaseReturn;
  }

  async updateStatus(id?: string, status?: string, userId?: string) {
    const purchaseReturn = await this.purchaseReturnModel.findById(id).exec();
    if (!purchaseReturn) throw new BadRequestException('Purchase return bill not found')

    const updatedPurchaseReturn = await this.purchaseReturnModel.findByIdAndUpdate(id,
      { purchaseReturnStatus: status, updatedBy: new Types.ObjectId(userId) },
      { new: true }).exec();
    return {
      status: 'success',
      message: 'Purchase return status updated successfully',
      purchaseReturn: updatedPurchaseReturn
    }
  }


}






