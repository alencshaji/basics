import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { PaymentMode, PaymentStatus } from "./purchase.schema";


export type SaleDocument = HydratedDocument<Sale>;


@Schema({ timestamps: true })
export class Sale {

    @Prop({ type: String, required: false })
   customerName: string;

    @Prop({ type: String, required: false })
    customerPhone: string;

    @Prop({ type: String, required: false })
    customerState: string;

    @Prop({ type: String, required: true })
    uniqueCode: string;

    @Prop({ type: Date, required: true })
    billDate: Date;

    @Prop({ type: Number, required: false })
    grossTotal: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalSgst: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalCgst: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalIgst: number;

    @Prop({ type: Number, required: false, default: 0 })
    totalAmount: number;

    @Prop({ type: Number, required: false, default: 0 })
    cess: number;

    @Prop({ type: Number, required: false, default: 0 })
    discount: number;

    @Prop({ type: Number, required: false })
    grandTotal: number;


    @Prop({ type: Boolean, default: true, required: false })
    isActive: boolean;

    @Prop({ type: Number, required: false })
    totalItems: number;


    @Prop({
        required: false,
        type: [{
            serviceName: { type: String, required: false },
            serviceId: { type: Types.ObjectId, ref: "Service", required: false },
            quantity: { type: Number, required: false },
            serviceCost: { type: Number, required: false },
            serviceItemTotal: { type: Number, required: false }
        }]
    })
    serviceDetails: {
        serviceName: string;
        serviceId: Types.ObjectId;
        quantity: number;
        serviceCost: number;
        serviceItemTotal: number;
    }[];


    @Prop({ required: false, type: Number, default: 0 })
    serviceTotal: number;

    @Prop({ required: false, type: Number, default: 0 })
    serviceDiscount: number;

    @Prop({ required: false, type: Number, default: 0 })
    serviceGrandTotal: number;

    @Prop({ required: false, type: Number, default: 0 })
    totalBillAmount: number;

    @Prop({ required: false, enum: PaymentStatus })
    paymentStatus: PaymentStatus;

    @Prop({ required: false, enum: PaymentMode})
    paymentMode: PaymentMode;

    @Prop({ required: true, type: Boolean,default: true })
    isDraft: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

}

export const SaleSchema = SchemaFactory.createForClass(Sale);