import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('posts/:id/vote')
  @HttpCode(HttpStatus.OK)
  votePost(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) postId: string,
  ) {
    return this.voteService.votePost(userId, postId);
  }

  @Delete('posts/:id/vote')
  unvotePost(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) postId: string,
  ) {
    return this.voteService.unvotePost(userId, postId);
  }

  @Post('comments/:id/vote')
  @HttpCode(HttpStatus.OK)
  voteComment(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
  ) {
    return this.voteService.voteComment(userId, commentId);
  }

  @Delete('comments/:id/vote')
  unvoteComment(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) commentId: string,
  ) {
    return this.voteService.unvoteComment(userId, commentId);
  }
}
