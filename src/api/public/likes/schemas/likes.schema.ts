import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LikesDocument = Likes & Document;

@Schema({ versionKey: false })
export class Likes {
  @Prop()
  id: string;

  @Prop()
  userId: string;

  @Prop()
  userBanStatus: boolean;

  @Prop()
  login: string;

  @Prop()
  parentId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  status: 'Like' | 'Dislike' | 'None';
}

export const LikesSchema = SchemaFactory.createForClass(Likes);
