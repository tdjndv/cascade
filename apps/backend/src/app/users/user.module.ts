import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { PostVote } from '../votes/post-vote.entity';
import { CommentVote } from '../votes/comment-vote.entity';
import { UserController } from './user.controller';
import { Comment } from '../comments/comment.entity';
import { Post } from '../posts/post.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment, PostVote, CommentVote]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
