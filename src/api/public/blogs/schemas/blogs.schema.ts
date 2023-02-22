import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogsDocument = Blogs & Document;

class BloggerInfoAdvantage {
	@Prop()
	userId: string;

	@Prop()
	userLogin: string
}

@Schema({ versionKey: false })
export class Blogs {
	@Prop()
	id: string;

	@Prop()
	name: string;

	@Prop()
	description: string;

	@Prop()
	websiteUrl: string;

	@Prop()
	createdAt: Date;

	@Prop()
	isMembership: boolean;

	@Prop({ type: BloggerInfoAdvantage })
	bloggerOwnerInfo: BloggerInfoAdvantage;
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);
