import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  body?: string;
}
