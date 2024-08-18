import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import exp from "constants";
import { HydratedDocument, Types } from "mongoose";

export type PurchaseDocument = HydratedDocument<Purchase>;

export enum PaymentMode {
    Credit='credit',
    Cash ='cash',
    Cheque='cheque',
    Online='online', 
    Card ='card'
}

export enum PaymentStatus {
    Paid='paid',
    Unpaid='unpaid',
    Partial='partiallypaid',
}

@Schema({ timestamps: true })
export class Purchase {

    @Prop({ type: String, required: true })
    uniqueCode: string;

    @Prop({ type: Date, required: true })
    billDate: Date;

   @Prop({
        required: false,
        type: {
            vendorId: { type: Types.ObjectId, ref: 'Vendor', required: true },
            vendorName: { type: String, required: false },
            place: { type: String, required: false },
            state: { type: String, required: false },
            gstNo: { type: String, required: false },
        }
    })

    vendorDetails: {
        vendorId: Types.ObjectId,
        vendorName: String,
        place: String,
        state: String,
        gstNo: String
    }

    @Prop({type:String, required:true})
    invoiceNumber: string;

    @Prop({type:Date, required:true})
    invoiceDate: Date;

    @Prop({type:Number, required:false})
    grossTotal: number;

    @Prop({type:Number, required:false,default:0})
    totalSgst: number;

    @Prop({type:Number, required:false,default:0})
    totalCgst: number;

    @Prop({type:Number, required:false,default:0})
    totalIgst: number;

    @Prop({type:Number, required:false,default:0})
    totalAmount: number;

    @Prop({type:Number, required:false,default:0})
    mrpTotal: number;

    @Prop({type:Number, required:false,default:0})
    cess: number;

    @Prop({type:Number, required:false,default:0})
    discount: number;

    @Prop({type:Number, required:false})
    grandTotal: number;

    @Prop({enum:PaymentMode, required:false})
    paymentMode: PaymentMode;

    @Prop({enum:PaymentStatus,default:PaymentStatus.Paid, required:false})
    paymentStatus: PaymentStatus;

    @Prop({type:Boolean, default:true, required:false})
    isActive: boolean;

    @Prop({type:Number, required:false})
    totalItems: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    @Prop({type:Boolean, default:true, required:true})
    isDraft: boolean;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

}






export const PurchaseSchema = SchemaFactory.createForClass(Purchase);