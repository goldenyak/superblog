import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comments, CommentsDocument } from "./schemas/comments.schema";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comments.name) private readonly commentsModel: Model<CommentsDocument>) {
  }

  async create(newComment: Comments) {
    return this.commentsModel.create(newComment);
  }
}