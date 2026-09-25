import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentVote } from './comment-vote.entity';
import { PostVote } from './post-vote.entity';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { Comment } from '../comments/comment.entity';
import { Post } from '../posts/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostVote, CommentVote, Post, Comment])],
  providers: [VoteService],
  controllers: [VoteController],
})
export class VoteModule {}
