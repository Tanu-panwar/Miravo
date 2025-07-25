import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsNotEmpty()
  content?: string;
}
