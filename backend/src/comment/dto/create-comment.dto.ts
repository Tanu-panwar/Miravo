import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  post: string; // ✅ Not postId
}
