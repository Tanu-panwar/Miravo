import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  image?: string;
}