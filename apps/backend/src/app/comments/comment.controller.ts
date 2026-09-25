// apps/backend/src/app/comments/comment.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { FeedQueryDto } from '../posts/dto/feed-query.dto';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @OptionalAuth()
  @Get('posts/:id/comments')
  findThread(
    @Param('id', ParseUUIDPipe) postId: string,
    @CurrentUser('sub') viewerId?: string,
  ) {
    return this.commentService.findThread(postId, viewerId);
  }

  @OptionalAuth()
  @Get('comments')
  findByAuthor(@Query() query: FeedQueryDto, @CurrentUser('sub') viewerId?: string) {
    return this.commentService.findByAuthor(
      query.author ?? '',
      query.page,
      query.limit,
      viewerId,
    );
  }

  @Post('posts/:id/comments')
  async create(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const comment = await this.commentService.create(userId, postId, dto);
    return this.commentService.toPublic(comment);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser('sub') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.commentService.remove(id, userId);
  }
}