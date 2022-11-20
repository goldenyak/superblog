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
  commentId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  status: 'Like' | 'Dislike' | 'None';
}

export const LikesSchema = SchemaFactory.createForClass(Likes);
