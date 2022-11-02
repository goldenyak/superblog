import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({ versionKey: false })
export class Auth {
	@Prop({unique: true})
	login: string;

	@Prop()
	password: string;

	@Prop({unique: true})
	email: string;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
