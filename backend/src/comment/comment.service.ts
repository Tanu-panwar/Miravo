// src/comment/comment.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Post, PostDocument } from '../post/schemas/post.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,

    @InjectModel(Post.name)
    private postModel: Model<PostDocument>,

    @InjectQueue('notification-queue')
    private notificationQueue: Queue,
  ) { }

  async create(dto: CreateCommentDto & { authorId: string }) {
    const newComment = new this.commentModel({
      content: dto.content,
      post: dto.post,
      author: dto.authorId,
    });

    const saved = await newComment.save();

    // Push job to queue
    await this.notificationQueue.add('new-comment', {
      type: 'new-comment',
      postId: dto.post,
      commentAuthor: dto.authorId,
    });

    return saved;
  }

  async findByPost(postId: string) {
    console.log("🛠️ Finding comments for postId:", postId);
    const comments = await this.commentModel
      .find({ post: postId })
      .populate('author', 'username photo') // populating only required fields
      .sort({ createdAt: -1 })
      .lean(); // returns plain JS objects

    return comments.map((comment) => {
      const author = comment.author;

      // 🛡️ Type guard to check if populated
      const isPopulated =
        author &&
        typeof author === 'object' &&
        'username' in author &&
        'photo' in author;

      return {
        ...comment,
        commentCreator: isPopulated
          ? {
            ...(author as any), // or define an interface if needed
            name: (author as any).username,
          }
          : {
            name: 'Unknown',
            photo: null,
          },
      };
    });
  }


  async update(id: string, dto: UpdateCommentDto) {
    return this.commentModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async delete(id: string) {
    return this.commentModel.findByIdAndDelete(id);
  }
}