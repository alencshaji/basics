import {
    Global,
    Injectable,
    Logger,
    Module,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Roles } from 'src/modules/user/dto/create-user.dto';
import { Company, companySchema } from 'src/schemas/company.schema';


@Injectable()
export class ConfigurationService implements OnApplicationBootstrap {
    private logger = new Logger(ConfigurationService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Company.name) private companyModel:Model<Company>
    ) { }

    async onApplicationBootstrap() {
       const company = await this.createDefaultCompany()
        await this.createDefaultAdmin()
    }


    async createDefaultAdmin() {
        try {
            let company = await this.companyModel.findOne({
                email: process.env.ADMIN_EMAIL,
            })
            let user = await this.userModel.findOne({
                email: process.env.ADMIN_EMAIL,
            });
            if (!user) {
                const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD, {
                    timeCost: 12,
                });
                user = await this.userModel.create({
                    name: 'Super Admin',
                    email: process.env.ADMIN_EMAIL,
                    phoneNumber: '0000000000',
                    password: hashedPassword,
                    uniqueCode: 'SUPERADMIN',
                    role:null,
                    companyId:company._id
                });
    
                this.logger.debug('Default admin user created');
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }

    async createDefaultCompany() {
        try {
            let company = await this.companyModel.findOne({
                email: process.env.ADMIN_EMAIL,
            });
            if (!company) {
                company = await this.companyModel.create({
                    name: 'COMPANY',
                    email: process.env.ADMIN_EMAIL,
                    address: 'Company ',
                    phone: '8086984151',
                    location: 'TDPA'
                });
    
                this.logger.debug('Default company user created');
                return company
            }
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    


}

@Global()
@Module({
    providers: [ConfigurationService],
    exports: [ConfigurationService],
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            {name:Company.name,schema:companySchema}
        ]),
    ],
})
export class ConfigurationModule { }

