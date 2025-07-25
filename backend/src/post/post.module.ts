import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { BullModule } from '@nestjs/bull';
import { NotificationGateway } from '../gateway/notification.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({ name: 'post-queue' }),
  ],
  providers: [PostService, NotificationGateway],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
