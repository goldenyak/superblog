
import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JwtDocument = Jwt & Document;

@Schema({ versionKey: false })
export class Jwt {
  @Prop({ unique: true })
  id: string;

  @Prop()
  token: string;

  @Prop()
  isValid: boolean;

  @Prop()
  expiresIn?: Date;

  @Prop()
  user: string;
}

export const JwtSchema = SchemaFactory.createForClass(Jwt);
