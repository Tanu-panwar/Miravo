import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Post, PostSchema } from '../post/schemas/post.schema'; // ✅ Post schema
import { PostModule } from '../post/post.module'; // ✅ Import PostModule
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: Post.name, schema: PostSchema }, // ✅ Register Post model too
    ]),
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    PostModule, // ✅ Import the PostModule here
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
