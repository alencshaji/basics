import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StockLocationDocument = HydratedDocument<StockLocation>;

@Schema({ timestamps: true })
export class StockLocation {

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;


    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;
}

export const StockLocationSchema = SchemaFactory.createForClass(StockLocation);

