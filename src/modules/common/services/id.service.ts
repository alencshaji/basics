import { Global, Injectable, Module } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Count, countSchema } from 'src/schemas/count.schema';


@Injectable()
export class IdService {
  constructor(
    @InjectModel(Count.name) private countModel: Model<Count>,
  ) { }

  async generateId(type: string, companyId: any) {

    let prefix: string;
    let countField: string;
    let defaultValue: number;
    let idNumber: number;
    switch (type) {
      case 'PURCHASE':
        prefix = 'P';
        countField = 'purchaseCount';
        defaultValue = 0;
        break;
      case 'SALE':
        prefix = 'S';
        countField = 'saleCount';
        defaultValue = 0;
        break;
      case 'SALE-RETURN':
        prefix = 'SR-';
        countField = 'saleReturnCount';
        defaultValue = 100;
        break;
      case 'PURCHASE_RETURN':
        prefix = 'PR-';
        countField = 'purchaseReturnCount';
        defaultValue = 100;
        break;
      case 'SERVICE':
        prefix = 'V-';
        countField = 'serviceCount';
        defaultValue = 100;

      default:
        throw new Error('Invalid data type');
    }
    const update = {
      $inc: { [countField]: 1 }
    };
    const options = { new: true, upsert: true };
    let countInstance = await this.countModel.findOne({ companyId: new Types.ObjectId(companyId) })
    if (countInstance) {
      countInstance = await this.countModel.findOneAndUpdate(
        { companyId: new Types.ObjectId(companyId) },
        update,
        options,
      );
    }

    if (!countInstance) {
      countInstance = await this.countModel.create({
        companyId: new Types.ObjectId(companyId),
        [countField]: defaultValue + 1,
      });
      idNumber = defaultValue + 1;
    } else {
      idNumber = countInstance[countField];
    }
    const formattedIdNumber = idNumber.toString().padStart(2, '0');
    return prefix + formattedIdNumber;
  }

}


@Global()
@Module({
  providers: [IdService],
  exports: [IdService],
  imports: [
    MongooseModule.forFeature([
      { name: Count.name, schema: countSchema },
    ]),
  ],
})
export class IdModule { }
