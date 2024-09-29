import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { VendorDocument } from 'src/schemas/vendor.schema';
import { Model, Types } from 'mongoose';
import { VendorSearchDto } from './dto/vendor-search.dto';

@Injectable()
export class VendorService {

  constructor(
    @InjectModel('Vendor') private readonly vendorModel: Model<VendorDocument>
  ) { }

  async create(createVendorDto?: CreateVendorDto, userId?: string, companyId?: string) {
    const vendor = await this.vendorModel.findOne({ name: createVendorDto.name, companyId: new Types.ObjectId(companyId) });
    if (vendor) {
      throw new BadRequestException('Company name already exists');
    }
    const newVendor = new this.vendorModel({
      ...createVendorDto,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
      ownedBy: new Types.ObjectId(userId),
      companyId: new Types.ObjectId(companyId)
    });
    await newVendor.save();

    return {
      status: 'success',
      message: 'Company created successfully',
      vendor: newVendor,
    };

  }

  async findAll(query?: VendorSearchDto, companyId?: string) {
    const filter: any = { companyId: new Types.ObjectId(companyId) };
    if (query.search) {
      filter.$or =  [
          { name: { $regex: query.search, $options: 'i' } },
          { location: { $regex: query.search, $options: 'i' } }
        ]
    }

    const page = +query.page || 1;
    const limit = +query.limit || 1000;
    const skip = (page - 1) * limit;
    const vendors = await this.vendorModel.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          _id: '$_id',
          name: '$name',
          location: '$location',
          gstNo: '$gstNo',
          phone: '$phone',
          email: '$email',
          state: '$state',
          address: '$address',
          isActive: '$isActive',
          createdAt: '$createdAt',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'total' }],
        },
      },
    ]);
    return {
      vendors: vendors[0]?.data || [],
      total: vendors[0]?.total[0]?.total || 0,
    };
  }

  async findAllVendor() {
    const vendors = await this.vendorModel.find().exec();
    return { vendors: vendors }
  }

  async findCompanyList(companyId?: string) {
    return await this.vendorModel.find({ isActive: true, companyId: new Types.ObjectId(companyId) }).select({ name: 1, _id: 1, location: 1, state: 1, gstNo: 1 }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    return await this.vendorModel.findById(id).exec();
  }

  async update(id?: string, updateVendorDto?: UpdateVendorDto, userId?: string, companyId?: string) {
    const vendor = await this.vendorModel.findById(id).exec();
    if (!vendor) {
      throw new BadRequestException('Company not found');
    }
    if (vendor.name !== updateVendorDto.name) {
      const existingVendor = await this.vendorModel.findOne({ name: updateVendorDto?.name, companyId: new Types.ObjectId(companyId) }).exec();
      if (existingVendor) throw new BadRequestException('Company name already exists')
    }
    const updatedVendor = await this.vendorModel.findByIdAndUpdate(id, { ...updateVendorDto, updatedBy: new Types.ObjectId(userId) }, { new: true }).exec();
    return {
      status: 'success',
      message: 'Company updated successfully',
      vendor: updatedVendor,
    };
  }

  async remove(id: string) {
    const vendor = await this.vendorModel.findById(id).exec()
    if (!vendor) {
      throw new BadRequestException('Company not found');
    }
    const deletedVendor = await this.vendorModel.findByIdAndDelete(id).exec();
    return {
      status: 'success',
      message: 'Company deleted successfully',
      vendor: deletedVendor,
    };

  }
}
