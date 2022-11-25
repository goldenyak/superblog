import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostsDocument = Posts & Document;

class NewestLikes {
  @Prop()
  addedAt: string
  userId: string
  login: string
}

class PostLikesInfoAdvantage {
	@Prop()
	likesCount: number;

	@Prop()
	dislikesCount: number;

	@Prop()
	myStatus: 'Like' | 'Dislike' | 'None';

	@Prop()
	newestLikes: NewestLikes[];
}

@Schema({ versionKey: false })
export class Posts {
	@Prop()
	id: string;

	@Prop()
	title: string;

	@Prop()
	shortDescription: string;

	@Prop()
	content: string;

	@Prop()
	blogId: string;

	@Prop()
	blogName: string;

	@Prop()
	createdAt: Date;

	@Prop({ type: PostLikesInfoAdvantage })
	extendedLikesInfo: PostLikesInfoAdvantage;
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
