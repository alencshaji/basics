import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type VendorDocument = HydratedDocument<Vendor>

@Schema({ timestamps: true })
export class Vendor {

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, required: true })
    phone: string;

    @Prop({ type: String })
    gstNo: string;

    @Prop({ type: String })
    email: string;

    @Prop({ type: String })
    location: string;

    @Prop({ type: String })
    state: string;
 
    @Prop({ type: String })
    address: string;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;


    @Prop({type:Types.ObjectId,ref:'User',required:false})
    createdBy:Types.ObjectId;
  
    @Prop({type:Types.ObjectId,ref:'User',required:false})
    updatedBy:Types.ObjectId;
  
    @Prop({type:Types.ObjectId,ref:'User',required:false})
    ownedBy:Types.ObjectId;

    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

}

export const vendorSchema = SchemaFactory.createForClass(Vendor);