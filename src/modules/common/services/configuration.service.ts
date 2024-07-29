import {
    Global,
    Injectable,
    Logger,
    Module,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Roles } from 'src/modules/user/dto/create-user.dto';


@Injectable()
export class ConfigurationService implements OnApplicationBootstrap {
    private logger = new Logger(ConfigurationService.name);
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
    ) { }

    async onApplicationBootstrap() {
        this.createDefaultAdmin()
    }


    async createDefaultAdmin() {
        try {
            let user = await this.userModel.findOne({
                email: process.env.ADMIN_EMAIL,
            });
            if (!user) {
                const hashedPassword = await argon2.hash(process.env.ADMIN_PASSWORD, {
                    timeCost: 12,
                });
                user = await this.userModel.create({
                    name: 'Admin',
                    email: process.env.ADMIN_EMAIL,
                    phoneNumber: '0000000000',
                    password: hashedPassword,
                    uniqueCode: 'ADMIN',
                    role: Roles.ADMIN
                });
    
                this.logger.debug('Default admin user created');
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
            { name: User.name, schema: UserSchema }
        ]),
    ],
})
export class ConfigurationModule { }

