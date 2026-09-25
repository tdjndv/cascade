import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { UserModule } from '../users/user.module';
import { PostModule } from '../posts/post.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentVote } from '../votes/comment-vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentVote]),
    UserModule,
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
