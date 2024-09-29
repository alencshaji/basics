import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Services } from 'src/schemas/service.schema';
import { Model, Types } from 'mongoose';
import { ServiceSearchDto } from './dto/search-service.dto';
import { IdService } from '../common/services/id.service';

@Injectable()

export class ServicesService {
  constructor(
    @InjectModel(Services.name) private readonly servicesModel: Model<Services>,
    private readonly idService: IdService,
  ) { }

  async create(createServiceDto?: CreateServiceDto, userId?: string,companyId?:string) {
    console.log(companyId);
    
    const service = await this.servicesModel.findOne({ name: createServiceDto.name,companyId:new Types.ObjectId(companyId) });
    if (service) throw new BadRequestException('Service already exists')

    const newService = await this.servicesModel.create(
      {
        ...createServiceDto,
        uniqueCode: await this.idService.generateId('SERVICE',new Types.ObjectId(companyId)),
        companyId:new Types.ObjectId(companyId),
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
        ownedBy: new Types.ObjectId(userId)
      }
    );
    return {
      status: 'success',
      message: 'Service created successfully',
      service: newService,
    }
  }

  async findAll(query?: ServiceSearchDto,companyId?:string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 0;
    const filter: any = {companyId:new Types.ObjectId(companyId)};
    let isActive;
    if (query?.isActive === 'true') {
      isActive = true;
    } else if (query?.isActive === 'false') {
      isActive = false;
    }
    if (query.search) {
      filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { area: { $regex: query.search, $options: 'i' } }
        ]
      }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    let serviceQuery = this.servicesModel.find(filter).sort({ createdAt: -1 });

    if (limit > 0) {
      serviceQuery = serviceQuery.skip((page - 1) * limit).limit(limit);
    }

    const service = await serviceQuery.exec();
    const total = await this.servicesModel.countDocuments(filter).exec();

    return { service, total };
  }


  async listAll(companyId?:string) {
    const service =await this.servicesModel.find({companyId:new Types.ObjectId(companyId)}).sort({ createdAt: -1 }).select({ name: 1, _id: 1 }).exec();
    return service
  }

  async findOne(id: string) {
    const service = await this.servicesModel.findById(id);
    if (!service) {
      throw new BadRequestException('Service not found');
    }
    return service
  }



  async update(id?: string, updateServiceDto?: UpdateServiceDto, userId?: string) {
    try {
      const service = await this.servicesModel.findByIdAndUpdate(id, {
        ...updateServiceDto,
        updatedBy: new Types.ObjectId(userId),
      }, { new: true });
      return {
        status: 'success',
        message: 'Service updated successfully',
        service: service,
      }
    } catch (err) {
      console.log(err)
    }

  }

  async remove(id: string) {
    const service = await this.servicesModel.findByIdAndRemove(id)
    return {
      service,
      status: 'success',
      message: 'Service deleted successfully',
    }
  }
}
