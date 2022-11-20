import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlogsDocument = Blogs & Document;

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
}

export const BlogsSchema = SchemaFactory.createForClass(Blogs);
