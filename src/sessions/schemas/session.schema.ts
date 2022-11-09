import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionsDocument = Sessions & Document;

@Schema({ versionKey: false })
export class Sessions {
  @Prop()
  ip: string;

  @Prop()
  title: string;

  @Prop()
  lastActiveDate: Date;

  @Prop()
  deviceId: string;

  @Prop()
  tokenExpiredDate: string;

  @Prop()
  userId: string;
}

export const SessionsSchema = SchemaFactory.createForClass(Sessions);