import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type AccessTokenDocument = HydratedDocument<AccessToken>;

@Schema({ timestamps: true })
export class AccessToken {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, type: Date })
  expiration: Date;

  @Prop({ required: true, type: Number, default: 0 })
  ttl: number;

  @Prop({ required: true, type: Boolean, default: false })
  loggedOut: boolean;
}

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken);
