import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export enum StockStatus{
    ExpiringSoon = 'expiring-soon',
    Expired = 'expired'
}

export type StockItemDocument = HydratedDocument<StockItem>;

@Schema({ timestamps: true })
export class StockItem{

    @Prop({ type: Types.ObjectId,ref:'ItemMaster', required: false })
    itemMasterId: Types.ObjectId;

    @Prop({ type: Types.ObjectId,ref:'vendors', required: true })
    vendorId: Types.ObjectId;

    @Prop({ type: String, required: false })
    name: string;

    @Prop({ type: Number, required: false })
    sgst: number;

    @Prop({ type: Number, required: false })
    cgst: number;

    @Prop({ type: Number, required: false })
    igst: number;

    @Prop({ type: Number, required: false })
    quantity: number;

    @Prop({ type: Types.ObjectId, ref: 'stocklocation', required: false })
    locationId: Types.ObjectId;

    @Prop({ type: String, required: false })
    locationName: string;

    @Prop({ type: String, required: false })
    boxNumber: string;

    @Prop({ type: Number, required: false })
    salePrice: number;

    @Prop({ type: Number, required: false })
    mrp: number;

    @Prop({ type: String, required: false })
    batch: string;

    @Prop({ type: Date, required: false })
    expiryDate: Date;

    @Prop({ type: Date, required: false })
    purchasedOn: Date;

    @Prop({ type: Number, required: false })
    unitRate: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

    @Prop({ enum: StockStatus, default: StockStatus.ExpiringSoon })
    status: StockStatus;

    @Prop({ type: Boolean, default: false })
    isUsed: boolean;

    @Prop({ type: Number, default: 0 })
    total: number;

    
    @Prop({type:Types.ObjectId,ref:'companyId',required:true})
    companyId:Types.ObjectId;
}

export const StockItemSchema = SchemaFactory.createForClass(StockItem);