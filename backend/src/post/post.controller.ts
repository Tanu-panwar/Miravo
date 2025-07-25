import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle( 3,60)
  createPost(@Request() req, @Body() dto: CreatePostDto) {
    console.log('Requested by user : ', req.user?.sub);
    return this.postService.enqueuePost(req.user.sub, dto);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMyPosts(@Request() req) {
    const userId = req.user.sub;
    const posts = await this.postService.findByUser(userId);
    console.log('Returning posts:', posts);
    return posts;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @Request() req) {
    return this.postService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @Request() req) {
    return this.postService.delete(id, req.user.sub); 
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id') postId: string, @Request() req) {
    return this.postService.likePost(postId, req.user.sub);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  unlikePost(@Param('id') postId: string, @Request() req) {
    return this.postService.unlikePost(postId, req.user.sub);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  getTimelinePosts(@Request() req) {
    return this.postService.getTimelinePosts(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getPost(@Param('id') id: string) {
    return this.postService.findOneWithDetails(id);
  }

  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  getDetailedPost(@Param('id') postId: string, @Request() req) {
    return this.postService.getDetailedPost(postId, req.user?.sub);
  }


}
