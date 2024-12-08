import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type SaleReturnItemDocument = HydratedDocument<SaleReturnItem>;

@Schema({
    timestamps: true
})
export class SaleReturnItem{

    @Prop({ type: Types.ObjectId, ref: 'SaleReturn', required: true })
    saleReturnId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ItemMaster', required: true })
    itemMasterId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SaleItem', required: true })
    saleItemId: Types.ObjectId;


    @Prop({ type: String, required: false })
    itemMasterName: string;

    @Prop({ type: Date, required: false })
    expiryDate: Date;

    @Prop({ type: String, required: false })
    batch: string;

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

    @Prop({ type: Types.ObjectId, ref: 'StockItem', required: false })
    stockId: Types.ObjectId;

    @Prop({ type: Number, required: false })
    quantity: number;  //return qty

    @Prop({ type: Number, required: false })
    totalQuantity: number;

    @Prop({ type: Number, required: false })
    rate: number;

    @Prop({ type: Number, required: false })
    unitRate: number;

    @Prop({ type: Number, required: false })
    total: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;
}

export const SaleReturnItemSchema = SchemaFactory.createForClass(SaleReturnItem);