import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post as PostModel, PostDocument } from './schemas/post.schema';
import { Model, Types } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { ForbiddenException } from '@nestjs/common';
import { Queue } from 'bull';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(PostModel.name)
    private postModel: Model<PostDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectQueue('post-queue')
    private postQueue: Queue,
    private notificationGateway: NotificationGateway,
  ) {}

  private mapPostWithUser(post: any, viewerObjectId?: Types.ObjectId | null) {
    if (!post?.authorId || typeof post.authorId !== 'object') {
      console.warn('⚠️ Skipping post due to missing or unpopulated authorId:', post);
      return null;
    }

    const isLiked = viewerObjectId
      ? post.likes?.some((id: Types.ObjectId) => id.equals(viewerObjectId))
      : false;

    return {
      _id: post._id.toString(),
      body: post.content,
      image: post.image || '',
      createdAt: post.createdAt || '',
      user: {
        _id: post.authorId._id.toString(),
        username: post.authorId.username,
        email: post.authorId.email,
        photo: post.authorId.photo || '',
      },
      isLiked,
      likes: post.likes || [],
      comments: Array.isArray(post.comments)
        ? post.comments.map((comment: any) => ({
            _id: comment._id.toString(),
            content: comment.content,
            createdAt: comment.createdAt || '',
            commentCreator: {
              _id: comment.author?._id?.toString() || '',
              name: comment.author?.username || 'Unknown',
              photo: comment.author?.photo || '/Avatar.jpg',
            },
          }))
        : [],
    };
  }

  async create(dto: CreatePostDto, userId: string) {
    const newPost = new this.postModel({
      ...dto,
      authorId: new Types.ObjectId(userId),
    });

    const savedPost = await newPost.save();
    const populated = await this.postModel
      .findById(savedPost._id)
      .populate('authorId', 'username email photo');

    return this.mapPostWithUser(populated);
  }

  async savePost(userId: string, dto: CreatePostDto) {
    const newPost = new this.postModel({
      ...dto,
      authorId: new Types.ObjectId(userId),
    });

    const savedPost = await newPost.save();
    const populated = await this.postModel
      .findById(savedPost._id)
      .populate('authorId', 'username email photo');

    return this.mapPostWithUser(populated);
  }

  async findAll(viewerId?: string) {
    const posts = await this.postModel
      .find()
      .populate('authorId', 'username email photo')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username photo',
        },
      })
      .sort({ createdAt: -1 });

    const viewerObjectId = viewerId ? new Types.ObjectId(viewerId) : null;

    return posts
      .map((post) => this.mapPostWithUser(post, viewerObjectId))
      .filter(Boolean);
  }

  async findByUser(authorId: string, viewerId?: string) {
    const posts = await this.postModel
      .find({ authorId: new Types.ObjectId(authorId) })
      .populate('authorId', 'username email photo')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username photo',
        },
      })
      .sort({ createdAt: -1 });

    const viewerObjectId = viewerId ? new Types.ObjectId(viewerId) : null;

    return posts
      .map((post) => this.mapPostWithUser(post, viewerObjectId))
      .filter(Boolean);
  }

  async update(id: string, dto: UpdatePostDto, userId: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (!post.authorId.equals(userId)) {
      throw new ForbiddenException('You can only update your own post');
    }

    const updated = await this.postModel.findByIdAndUpdate(id, dto, { new: true });
    return updated;
  }

  async delete(id: string, userId: string) {
    const post = await this.postModel.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    if (!post.authorId.equals(userId)) {
      throw new ForbiddenException('You can only delete your own post');
    }

    await this.postModel.findByIdAndDelete(id);
    return { message: 'Post deleted successfully' };
  }

  async findOneWithDetails(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('authorId', 'username email photo')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username',
        },
      });

    if (!post) throw new NotFoundException('Post not found');

    return this.mapPostWithUser(post);
  }

  async getDetailedPost(postId: string, viewerId?: string) {
    const post = await this.postModel
      .findById(postId)
      .populate({
        path: 'authorId',
        select: 'username email photo',
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username',
        },
      });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const viewerObjectId = viewerId ? new Types.ObjectId(viewerId) : null;
    const isLikedByMe = viewerObjectId
      ? post.likes.some((id: Types.ObjectId) => id.equals(viewerObjectId))
      : false;

    return {
      _id: post._id,
      body: post.content,
      image: post.image || null,
      user: {
        _id: post.authorId._id.toString(),
        // username: post.authorId.username,
        // email: post.authorId.email,
        // photo: post.authorId.photo || '',
      },
      isLiked: isLikedByMe,
      comments: post.comments,
    };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const userObjectId = new Types.ObjectId(userId);
    const alreadyLiked = post.likes.some((id) => id.equals(userObjectId));

    if (!alreadyLiked) {
      post.likes.push(userObjectId);
      await post.save();

      const user = await this.userModel.findById(userId);
      if (user) {
        this.notificationGateway.sendNotification(
          post.authorId.toString(),
          `❤️ ${user.username} liked your post`,
        );
      }

      return {
        message: 'Post liked',
        likeCount: post.likes.length,
        likerName: user?.username,
      };
    }

    return {
      message: 'Already liked',
      likeCount: post.likes.length,
      likerName: null,
    };
  }

  async unlikePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const userObjectId = new Types.ObjectId(userId);
    post.likes = post.likes.filter((id) => !id.equals(userObjectId));
    await post.save();

    return { message: 'Post unliked' };
  }

  async getTimelinePosts(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const posts = await this.postModel
      .find({
        authorId: { $in: [new Types.ObjectId(userId), ...user.following] },
      })
      .populate('authorId', 'username email photo')
      .sort({ createdAt: -1 });

    return posts.map((post) => this.mapPostWithUser(post)).filter(Boolean);
  }

  async enqueuePost(userId: string, dto: CreatePostDto) {
    await this.postQueue.add(
      'create-post',
      { userId, postData: dto },
      { delay: 5000 },
    );
    return { message: 'Post will be created in 5 seconds' };
  }
}
