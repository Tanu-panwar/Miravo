import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../post/schemas/post.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Model } from 'mongoose';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
@Processor('notification-queue')
export class NotificationProcessor {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationGateway: NotificationGateway,
  ) {}

  @Process('new-comment')
  async handleNewComment(job: Job<{ type: string; postId: string; commentAuthor: string }>) {
    const { type, postId, commentAuthor } = job.data;

    console.log('🎯 Job received:', job.data);

    const post = await this.postModel.findById(postId).lean();
    const authorUser = await this.userModel.findById(commentAuthor).lean();

    if (!post || !authorUser) return;

    const postOwner = await this.userModel.findById(post.authorId).lean();
    if (!postOwner) return;

    this.notificationGateway.sendNotification(
      postOwner._id.toString(),
      `💬 ${authorUser.username} commented on your post`
    );
  }

  // 🔁 Future job processor for new-post if needed:
  @Process('new-post')
  async handleNewPost(job: Job<{ userId: string; body: string; image?: string }>) {
    const { userId, body, image } = job.data;
    const user = await this.userModel.findById(userId).lean();
    if (!user || !user.followers) return;

    const followers = await this.userModel.find({
      _id: { $in: user.followers },
    }).lean();

    for (const follower of followers) {
      this.notificationGateway.sendNotification(
        follower._id.toString(),
        `📝 ${user.username} created a new post`
      );
    }
  }
}
