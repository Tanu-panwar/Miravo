import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { NotificationGateway } from '../gateway/notification.gateway';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationGateway: NotificationGateway,
  ) { }

  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).select('-password');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findAllExcept(currentUserId: string) {
    const currentUser = await this.userModel.findById(currentUserId);

    const users = await this.userModel
      .find({ _id: { $ne: currentUserId } })
      .select("username email followers");

    return users.map(user => ({
      _id: user._id,
      username: user.username,
      email: user.email,
      isFollowed: user.followers.some(
        (followerId: Types.ObjectId) => followerId.toString() === currentUserId
      ),
    }));
  }


  async updateProfilePhoto(userId: string, photoUrl: string) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { photo: photoUrl },
      { new: true },
    );
    return { user };
  }


  async followUser(userId: string, targetUserId: string) {
    const user = await this.userModel.findById(userId);
    const target = await this.userModel.findById(targetUserId);

    if (!user || !target) throw new NotFoundException("User not found");

    const targetObjectId = new Types.ObjectId(targetUserId);
    const userObjectId = new Types.ObjectId(userId);

    if (!user.following.map(id => id.toString()).includes(targetUserId)) {
      user.following.push(targetObjectId);
      target.followers.push(userObjectId);
      await user.save();
      await target.save();

      this.notificationGateway.sendNotification(
        targetUserId,
        `🔔 ${user.username} followed you`,
      );
    }

    return {
      message: 'Followed successfully',
      followerName: user.username, // ✅ added this
    };
  }

  // ✅ Unfollow a user
  async unfollowUser(userId: string, targetUserId: string) {
    const user = await this.userModel.findById(userId);
    const target = await this.userModel.findById(targetUserId);

    if (!user || !target) throw new NotFoundException("User not found");

    const targetObjectId = new Types.ObjectId(targetUserId);
    const userObjectId = new Types.ObjectId(userId);

    // Check if currently following
    const isFollowing = user.following.some(id => id.equals(targetObjectId));
    if (isFollowing) {
      user.following = user.following.filter(id => !id.equals(targetObjectId));
      target.followers = target.followers.filter(id => !id.equals(userObjectId));

      await user.save();
      await target.save();

      // Optional: send notification or log
    }

    return { message: "Unfollowed successfully" };
  }
}
