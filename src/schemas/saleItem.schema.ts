import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type SaleItemDocument = HydratedDocument<SaleItem>;


@Schema({ timestamps: true })
export class SaleItem {


    @Prop({ type: Types.ObjectId, ref: 'Sale', required: true })
    saleId: Types.ObjectId;

    @Prop({ type:Number,required: false,default:0 })
    returnedQty: number;

    @Prop({ type: Types.ObjectId, ref: 'ItemMaster', required: false })
    itemMasterId: Types.ObjectId;

    @Prop({ type: String, required: false })
    itemMasterName: string;

    @Prop({ type: Date, required: false })
    expiryDate: Date;

    @Prop({ type: String, required: false })
    hsn: string;

    @Prop({ type: Types.ObjectId, ref: 'Manufacturer', required: false })
    manufacturerId: Types.ObjectId;

    @Prop({ type: String, required: false })
    manufacturerName: string;

    @Prop({ type: Number, required: false })
    sgst: number;

    @Prop({ type: Number, required: false })
    sgstValue: number;

    @Prop({ type: Number, required: false })
    cgst: number;


    @Prop({ type: Number, required: false })
    cgstValue: number;


    @Prop({ type: Number, required: false })
    igst: number;

    @Prop({ type: Number, required: false })
    igstValue: number;

    @Prop({ type: Types.ObjectId, ref: 'StockItem', required: true })
    stockId: Types.ObjectId;

    @Prop({ type: Number, required: false })
    quantity: number;

    @Prop({ type: Number, required: false })
    mrp: number;

    @Prop({ type: String, required: false })
    batch: string;


    @Prop({ type: Number, required: false })
    rate: number;

    @Prop({ type: Number, required: false })
    roundOff: number;

    @Prop({ type: Number, required: false })
    unitRate: number;

    @Prop({ type: Number, required: false })
    total: number;

    @Prop({ type: Number, required: false })
    grossTotal: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;
}

export const SaleItemSchema = SchemaFactory.createForClass(SaleItem);