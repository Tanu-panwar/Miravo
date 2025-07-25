import { IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  content?: string;

  @IsOptional()
  image?: string;
}
