import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { IsArray, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Roles } from 'src/modules/user/dto/create-user.dto';


export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false })
  password: string;


  @Prop()
  role: Roles;

  @Prop()
  otp: string;

  @Prop({type:Types.ObjectId,ref:'Department',required:false})
  department: Types.ObjectId;

  @Prop({type:Types.ObjectId,ref:'Company',required:false})
  companyId: Types.ObjectId;

  // @Prop({ required: true })
  // designation: string;

  // @Prop()
  // passwordChangedAt: Date;

  // @Prop()
  // passwordResetToken: string;

  // @Prop()
  // passwordResetExpires: Date;

  @Prop({ default: true, select: false })
  isActive: boolean;

  // @Prop()
  // refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
