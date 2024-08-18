import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


export type CountDocument = HydratedDocument<Count>;

@Schema({
    timestamps:true,
})
export class Count{

    @Prop({ type: Number, default: 0 })
    purchaseCount:number;

    @Prop({ type: Number, default: 0 })
    saleCount:number;

    @Prop({ type: Number, default: 0 })
    serviceCount:number;

    @Prop({ type: Number, default: 0 })
    saleReturnCount:number;

    @Prop({ type: Number, default: 0 })
    purchaseReturnCount:number;

    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;
}

export const countSchema= SchemaFactory.createForClass(Count);
