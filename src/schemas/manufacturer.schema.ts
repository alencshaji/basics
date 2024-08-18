import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type ManufacturerDocument = HydratedDocument<Manufacturer>;

@Schema({timestamps:true})
export class Manufacturer{

    @Prop({required:true})
    name:string;

    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;


}

export const ManufacturerSchema = SchemaFactory.createForClass(Manufacturer);
