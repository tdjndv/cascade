import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostVote } from './post-vote.entity';
import { Repository } from 'typeorm';
import { CommentVote } from './comment-vote.entity';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,

    @InjectRepository(CommentVote)
    private readonly commentVoteRepository: Repository<CommentVote>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async votePost(userId: string, postId: string): Promise<{ score: number }> {
    const exists = await this.postRepository.exists({ where: { id: postId } });
    if (!exists) throw new NotFoundException('Post not found');

    try {
      await this.postVoteRepository.insert({ userId, postId });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Already voted');
      }
      throw err;
    }
    return {
      score: await this.postVoteRepository.count({ where: { postId } }),
    };
  }

  async unvotePost(userId: string, postId: string): Promise<{ score: number }> {
    const result = await this.postVoteRepository.delete({ userId, postId });
    if (result.affected === 0) throw new NotFoundException('Vote not found');

    return {
      score: await this.postVoteRepository.count({ where: { postId } }),
    };
  }

  async voteComment(
    userId: string,
    commentId: string,
  ): Promise<{ score: number }> {
    const exists = await this.commentRepository.exists({
      where: { id: commentId },
    });
    if (!exists) {
      throw new NotFoundException('Comment not found');
    }
    try {
      await this.commentVoteRepository.insert({ userId, commentId });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Already voted');
      }
      throw err;
    }
    return {
      score: await this.commentVoteRepository.count({ where: { commentId } }),
    };
  }

  async unvoteComment(
    userId: string,
    commentId: string,
  ): Promise<{ score: number }> {
    const result = await this.commentVoteRepository.delete({
      userId,
      commentId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Vote not found');
    }
    return {
      score: await this.commentVoteRepository.count({ where: { commentId } }),
    };
  }
}
