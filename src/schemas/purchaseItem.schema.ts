import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type purchaseItemDocument = HydratedDocument<PurchaseItem>;

@Schema({ timestamps: true })
export class PurchaseItem{

    @Prop({ type: Types.ObjectId, ref: 'Purchase', required: true })
    purchaseId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ItemMaster', required: true })
    itemMasterId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Pack', required: false })
    packId: Types.ObjectId;

    @Prop({ type:String, required: false })
    packQuantity:number;


    @Prop({ type: String, required: false })
    itemMasterName: string;

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
    purchaseQuantity: number;

    @Prop({ type: Number, required: false })
    freeQuantity: number;

    @Prop({ type: Number, required: false })
    quantity: number;

    @Prop({ type: Number, required: false })
    purchaseRate: number;

    @Prop({ type: Number, required: false })
    mrp: number;

    @Prop({ type: Number, required: false })
    salePrice: number;

    @Prop({ type: String, required: false })
    batch: string;

    @Prop({ type: String, required: false })
    location: string;

    @Prop({ type: String, required: false })
    boxNumber: string;

    @Prop({ type: Date, required: false })
    expiryDate: Date;

    @Prop({ type: Number, required: false })
    unitRate: number;

    @Prop({ type: Number, required: false})
    total:number;

    @Prop({ type: Number, required: false,default:0 })
    returnedQty: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    
    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

}

export const purchaseItemSchema = SchemaFactory.createForClass(PurchaseItem);