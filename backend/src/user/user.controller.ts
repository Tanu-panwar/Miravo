import {
  Controller,
  Get,
  UseGuards,
  Request,
  Put,
  Post,
  Param,
  Patch,
  UploadedFile,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../utils/multer.options';
import { Multer } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'Welcome to your profile!',
      user: req.user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllUsers(@Request() req) {
    const currentUserId = req.user.sub;
    const users = await this.userService.findAllExcept(currentUserId);
    return {
      myId: currentUserId,
      users,
    };
  }

  // POST /upload
  @Post("/upload")
  @UseInterceptors(FileInterceptor("image", multerOptions))
  upload(@UploadedFile() file: Multer.File) {
    const imageUrl = `/uploads/${file.filename}`;
    return { imageUrl };
  }


  @UseGuards(JwtAuthGuard)
  @Patch('photo')
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  async updatePhoto(
    @UploadedFile() file: Multer.File,
    @Req() req,
  ) {
    const userId = req.user.sub;
    const photoUrl = `http://localhost:8080/uploads/${file.filename}`;
    return this.userService.updateProfilePhoto(userId, photoUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/follow')
  followUser(@Param('id') targetId: string, @Request() req) {
    return this.userService.followUser(req.user.sub, targetId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/unfollow')
  unfollowUser(@Param('id') targetId: string, @Request() req) {
    return this.userService.unfollowUser(req.user.sub, targetId);
  }
}
