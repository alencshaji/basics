import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type itemMasterDocument = HydratedDocument<ItemMaster>;

@Schema({timestamps: true})
export class ItemMaster{

    @Prop({type:String,required:true})
    name: string;

    @Prop({type:String,required:false})
    filterName: string;

    @Prop({type:String,required:false})
    tyreSize: string;

    @Prop({type:Types.ObjectId, ref: 'Pack',required:true})
    packId: Types.ObjectId;


    @Prop({type:String,required:true})
    packName: string;

    @Prop({type:Types.ObjectId, ref: 'Vendor',required:true})
    vendorId:Types.ObjectId;

    @Prop({ type: String, required: true })
    vendorName:string;

    @Prop({ type: Types.ObjectId, ref: 'Manufacturer', required: false })
    manufacturerId: Types.ObjectId;

    @Prop({ type: String, required: false })
    manufacturerName: string;

    @Prop({ type: String, required: false })
    hsn: string;

    @Prop({ type: Number, required: false })
    reorderLevel: number;

    @Prop({ type: Number, required: false,default:0 })
    quantity: number;

    @Prop({ type: Number, required: false,default:0 })
    batchCount: number;

    @Prop({ type: Number, required: false })
    sgst: number;

    @Prop({ type: Number, required: false })
    cgst: number;

    @Prop({ type: Number, required: false })
    igst: number;

    
    @Prop({type:Number,required:false})
    totalQuantity: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

}

export const ItemMasterSchema = SchemaFactory.createForClass(ItemMaster);