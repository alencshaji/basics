import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { PaymentMode, PaymentStatus } from "./purchase.schema";

export type SaleReturnDocument = HydratedDocument<SaleReturn>;

@Schema({timestamps: true})
export class SaleReturn{

    @Prop({ type: String, required: true })
    uniqueCode: string;

    @Prop({ type: Date, required: true })
    billDate: Date;

    @Prop({type: Types.ObjectId, ref: 'Sale', required: true})
    saleId: Types.ObjectId;

    @Prop({ type: String, required: true })
    saleCode: string;

    @Prop({type: String, required: false})
    customerName: string;

    @Prop({type: String, required: false})
    customerPhone: string;

    @Prop({type: String, required: false})
    customerState: string;

    @Prop({ type: String, required: false })
    reason: string;

    @Prop({ type: Number, required: false })
    grossTotal: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalSgst: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalCgst: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalIgst: number;

    @Prop({ type: Number, required: false })
    grandTotal: number;


    @Prop({ required: false, enum: PaymentMode, default: 0 })
    paymentMode: PaymentMode;

    @Prop({ required: false, enum: PaymentStatus, default: 0 })
    paymentStatus: PaymentStatus;

    @Prop({type:Boolean, required:false, default:true})
    isActive:boolean;

    @Prop({type:Types.ObjectId, ref:'User', required:false})
    createdBy:Types.ObjectId;

    @Prop({type:Types.ObjectId, ref:'User', required:false})
    updatedBy:Types.ObjectId;

    @Prop({type:Types.ObjectId, ref:'User', required:false})
    ownedBy:Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'companyId',required:true})
    companyId:Types.ObjectId;

}

export const SaleReturnSchema = SchemaFactory.createForClass(SaleReturn);