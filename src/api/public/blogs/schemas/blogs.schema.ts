import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogsDocument = Blogs & Document;

class BloggerInfoAdvantage {
	@Prop()
	id: string;

	@Prop()
	login: string
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

	@Prop({ type: BloggerInfoAdvantage })
	bloggerInfo: BloggerInfoAdvantage;
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);
