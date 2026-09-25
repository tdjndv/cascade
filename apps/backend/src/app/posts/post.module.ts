import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { PostVote } from '../votes/post-vote.entity';
import { UserModule } from '../users/user.module';
import { PostController } from './post.controller';
import { Comment } from '../comments/comment.entity';
import { PostService } from './post.service';
@Module({
  imports: [TypeOrmModule.forFeature([Post, PostVote, Comment]), UserModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
