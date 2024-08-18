import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { timeStamp } from "console";
import { HydratedDocument, Types } from "mongoose";


export type PackDocument =HydratedDocument<Pack>;

@Schema({ timestamps: true })   
export class Pack {

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({type:Types.ObjectId,ref:'Company',required:true})
    companyId:Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy: Types.ObjectId;
    
    @Prop({ type: Types.ObjectId, ref: 'User' })
    updatedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    ownedBy: Types.ObjectId;

}

export const packSchema = SchemaFactory.createForClass(Pack);