// apps/backend/src/app/posts/post.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { FeedQueryDto } from './dto/feed-query.dto';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @OptionalAuth()
  @Get()
  findFeed(@Query() query: FeedQueryDto, @CurrentUser('sub') viewerId?: string) {
    return this.postService.findFeed(query.page, query.limit, query.author, viewerId);
  }

  @OptionalAuth()
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') viewerId?: string,
  ) {
    return this.postService.findOneWithStats(id, viewerId);
  }

  @HttpPost()
  async create(@CurrentUser('sub') userId: string, @Body() dto: CreatePostDto) {
    const post = await this.postService.create(userId, dto);
    return { id: post.id };
  }
}