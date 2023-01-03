import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

class BanInfoAdvantage {
	@Prop()
	isBanned: boolean

	@Prop()
	banDate: string

	@Prop()
	banReason: 'notBanned' | 'all' | 'banned'
}

@Schema({ versionKey: false })
export class User {
	@Prop()
	id: string;

	@Prop()
	login: string;

	@Prop()
	email: string;

	@Prop()
	password: string;

	@Prop()
	createdAt: Date;

	@Prop()
	confirmationCode: string;

	@Prop()
	isConfirmed: boolean;

	@Prop()
	recoveryCode?: string;

	@Prop({ type: BanInfoAdvantage })
	banInfo: BanInfoAdvantage;

}

export const UserSchema = SchemaFactory.createForClass(User);
