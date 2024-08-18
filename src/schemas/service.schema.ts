import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type ServiceDocument = HydratedDocument<Services>;


@Schema({ timestamps: true })
export class Services {
    @Prop({ type:String, required: true })
    uniqueCode: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    area: string;

    @Prop({ type: String, required: false })
    description: string;

    @Prop({ type: Number, required: true, default: 0 })
    cost: number;

    @Prop({type:Boolean,required:true,default:true})
    isActive: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: false })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'companyId',required:true})
    companyId:Types.ObjectId;
}

export const ServicesSchema = SchemaFactory.createForClass(Services);