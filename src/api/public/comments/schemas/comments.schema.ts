import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentsDocument = Comments & Document;

class CommentLikesInfoAdvantage {
	@Prop()
	likesCount: number;

	@Prop()
	dislikesCount: number;

	@Prop()
	myStatus: 'Like' | 'Dislike' | 'None';
}

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

	@Prop({ type: CommentLikesInfoAdvantage })
	likesInfo?: CommentLikesInfoAdvantage;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
