import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { timeStamp } from "console";
import { HydratedDocument, Types } from "mongoose";


export type CompanyDocument =HydratedDocument<Company>;

@Schema({ timestamps: true })   
export class Company {

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: false })
    email: string;

    @Prop({ type: String, required: false })
    address: string;

    @Prop({ type: String, required: false })
    phone: string;

    @Prop({ type: String, required: false })
    location: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
    
    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

}

export const companySchema = SchemaFactory.createForClass(Company);