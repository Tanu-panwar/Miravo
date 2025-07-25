import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Processor('post-queue')
export class PostProcessor {
  constructor(private readonly postService: PostService) {}

  @Process('create-post')
  async handleCreatePost(
    job: Job<{ userId: string; postData: CreatePostDto }>
  ) {
    const { userId, postData } = job.data;

    console.log('🔁 [BullMQ] Creating post for user:', userId);
    console.log('📦 Job Data:', postData);

    try {
      const createdPost = await this.postService.savePost(userId, postData);
      console.log('✅ Post created successfully with ID:', createdPost?._id);
      return createdPost;
    } catch (error) {
      console.error('❌ Failed to create post from job queue:', error);
      throw error;
    }
  }
}
