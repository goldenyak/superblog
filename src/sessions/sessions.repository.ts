import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sessions, SessionsDocument } from "./schemas/session.schema";

@Injectable()
export class SessionsRepository {
  constructor(@InjectModel(Sessions.name) private readonly sessionsModel: Model<SessionsDocument>) {}


  async deleteAll() {
    return this.sessionsModel.deleteMany().exec();
  }
}
