import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({versionKey: false})
export class User {
	@Prop()
	id: string;

	@Prop()
	login: string;

	@Prop()
	email: string;

	@Prop()
	createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
