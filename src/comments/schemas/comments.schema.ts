import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommentsDocument = Comments & Document;

export class MyStatus {
	@Prop()
	like: string;

	@Prop()
	dislike: string;

	@Prop()
	none: string;
}

export class LikesInfoAdvantage {
	@Prop()
	likesCount: number;

	@Prop()
	dislikesCount: number;

	@Prop()
	myStatus: 'like' | 'dislike' | 'none';

	@Prop()
	type: 'comment'
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

	@Prop({ type: LikesInfoAdvantage })
	likesInfo?: LikesInfoAdvantage;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
