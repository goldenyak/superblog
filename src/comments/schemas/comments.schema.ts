import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentsDocument = Comments & Document;

@Schema({ versionKey: false })
export class Comments {
  @Prop()
  id: string;

  @Prop()
  content: string;

  @Prop()
  userId: string;

  @Prop()
  userLogin: string;

  @Prop()
  postId: string;

  @Prop()
  createdAt: Date;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);