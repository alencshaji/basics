import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ReturnStatus } from "src/modules/purchase/dto/create-purchaseReturn.dto";

export type PurchaseReturnDocument = HydratedDocument<PurchaseReturn>;
@Schema({ timestamps: true })
export class PurchaseReturn {

    @Prop({ type: String, required: true })
    uniqueCode: string;

    @Prop({ type: Date, required: true })
    billDate: Date;

    @Prop({ type:Types.ObjectId, ref: 'Purchase', required: true })
    purchaseId: Types.ObjectId;

    @Prop({ type: String, required: false })
    purchaseBillNumber: string;

    @Prop({ type: String, required: false })
    purchaseInvoiceNumber: string;

    @Prop({ type: Date, required: false })
    purchaseInvoiceDate: Date;

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

    @Prop({type:String, required:false})
    reason:string;

    @Prop({ type: Number, required: false })
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
    cess: number;

    @Prop({type:Number, required:false,default:0})
    others: number;

    @Prop({type:Number, required:false,default:0})
    grandTotal: number;

    @Prop({ type: Boolean, default: true, required: false })
    isActive: boolean;

    @Prop({enum:ReturnStatus,required:true})
    purchaseReturnStatus:ReturnStatus;

    @Prop({ type:Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type:Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type:Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

}

export const purchaseReturnSchema = SchemaFactory.createForClass(PurchaseReturn);