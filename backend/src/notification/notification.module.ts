// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationProcessor } from '../queue/notification.processor';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from '../post/schemas/post.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { NotificationGateway } from '../gateway/notification.gateway';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
  ],
  providers: [NotificationProcessor, NotificationGateway],
  exports: [NotificationGateway], // ✅ ADD THIS LINE
})
export class NotificationModule {}
