import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Pack } from 'src/schemas/pack.schema';

@Injectable()

export class PackService {
  constructor(
    @InjectModel('Pack') private readonly packModel: Model<Pack>
  ) { }

  async create(createPackDto?: CreatePackDto, userId?: string,companyId?:string) {
    const pack = await this.packModel.findOne({ name: createPackDto.name,companyId:new Types.ObjectId(companyId) }).exec()
    if (pack) throw new BadRequestException('Pack name already exists')
    const newPack = new this.packModel({
      ...createPackDto,
      companyId:new Types.ObjectId(companyId),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
      ownedBy: new Types.ObjectId(userId),
    })
    await newPack.save()
    return {
      status: 'success',
      message: 'Pack created successfully',
      data: newPack
    }
  }
  async findAll(search?: string, page?: number, limit?: number,companyId?:string) {
    page = Number(page) || 1;
    limit = Number(limit) || 0;
    const filter: any = {companyId:new Types.ObjectId(companyId)};
    
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    } 
  
    const query = this.packModel.find(filter).sort({ createdAt: -1 });
  
    if (limit > 0) {
      query.skip((page - 1) * limit).limit(limit);
    }
  
    const packs = await query.exec();
    const total = await this.packModel.countDocuments({ ...filter }).exec();
  
    if (!packs || packs.length === 0) {
      throw new BadRequestException('No packs found');
    }
  
    return { packs: packs, total: total };
  }
  



  async findOne(id: string) {
    const pack = await this.packModel.findById(id).exec()
    if (!pack) throw new BadRequestException('Pack not found')
    return pack
  }

  async update(id?: string, updatePackDto?: UpdatePackDto, userId?: string,companyId?:string) {
    const pack = await  this.packModel.findById(id).exec()
    if (!pack) throw new BadRequestException('Pack not found')
    if(pack.name !== updatePackDto.name){
      const existingPack = await this.packModel.findOne({name:updatePackDto?.name,companyId:new Types.ObjectId(companyId)}).exec();
      if(existingPack) throw new BadRequestException('Pack name already exists')
    }
    const newPack = await this.packModel.findByIdAndUpdate(
      id,
      { ...updatePackDto, updatedBy: new Types.ObjectId(userId) },
      { new: true })
      .exec()
    await newPack.save()
    return {
      status: 'success',
      message: 'Pack updated successfully',
      data: newPack
    };
  }

  async remove(id: string) {
    const pack = await this.packModel.findByIdAndDelete(id).exec();
    return {
      status: 'success',
      message: 'Pack deleted successfully',
      data: pack
    };
  }
}
