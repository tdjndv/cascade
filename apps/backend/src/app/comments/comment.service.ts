// apps/backend/src/app/comments/comment.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PostService } from '../posts/post.service';
import { UserService } from '../users/user.service';
import { CommentVote } from '../votes/comment-vote.entity';
import { Comment } from './comment.entity';
import { PublicComment, UserComment } from '../type/comment.type';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(CommentVote)
    private readonly commentVoteRepository: Repository<CommentVote>,

    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<Comment> {
    await this.postService.findOneOrFail(postId);

    if (dto.parentId) {
      const parent = await this.commentRepository.findOne({
        where: { id: dto.parentId },
        select: { id: true, postId: true },
      });

      if (!parent) throw new NotFoundException('Parent comment not found');

      if (parent.postId !== postId) {
        throw new BadRequestException('Parent comment belongs to a different post');
      }
    }

    const comment = this.commentRepository.create({
      body: dto.body.trim(),
      postId,
      userId,
      parentId: dto.parentId ?? null,
    });

    const saved = await this.commentRepository.save(comment);

    return this.commentRepository.findOneOrFail({
      where: { id: saved.id },
      relations: { user: true },
    });
  }

  async findThread(postId: string, viewerId?: string): Promise<PublicComment[]> {
    const comments = await this.commentRepository.find({
      where: { postId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
      withDeleted: true,
    });

    const ids = comments.map((c) => c.id);

    const [scores, voted] = await Promise.all([
      this.countVotes(ids),
      viewerId ? this.findVotedIds(viewerId, ids) : Promise.resolve(new Set<string>()),
    ]);

    return this.buildTree(comments, scores, voted);
  }

  async findByAuthor(
    username: string,
    page: number,
    limit: number,
    viewerId?: string,
  ): Promise<{ items: UserComment[]; total: number }> {
    const user = await this.userService.findByUsernameOrFail(username);

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { userId: user.id },
      relations: { user: true, post: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const ids = comments.map((c) => c.id);

    const [scores, voted] = await Promise.all([
      this.countVotes(ids),
      viewerId ? this.findVotedIds(viewerId, ids) : Promise.resolve(new Set<string>()),
    ]);

    const items = comments.map((comment) => ({
      ...this.toPublic(comment, scores.get(comment.id) ?? 0, voted.has(comment.id)),
      post: { id: comment.post.id, title: comment.post.title },
    }));

    return { items, total };
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment || comment.userId !== userId) {
      throw new NotFoundException('Comment not found');
    }

    await this.commentRepository.softRemove(comment);
  }

  toPublic(comment: Comment, score = 0, hasVoted = false): PublicComment {
    const deleted = comment.deletedAt !== null;

    return {
      id: comment.id,
      body: deleted ? '[deleted]' : comment.body,
      author: deleted ? null : this.userService.toPublic(comment.user),
      deleted,
      score,
      hasVoted,
      createdAt: comment.createdAt.toISOString(),
      replies: [],
    };
  }

  private async countVotes(ids: string[]): Promise<Map<string, number>> {
    if (ids.length === 0) return new Map();

    const rows = await this.commentVoteRepository
      .createQueryBuilder('v')
      .select('v.commentId', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('v.commentId IN (:...ids)', { ids })
      .groupBy('v.commentId')
      .getRawMany<{ key: string; count: string }>();

    return new Map(rows.map((r) => [r.key, Number(r.count)]));
  }

  private async findVotedIds(userId: string, ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();

    const rows = await this.commentVoteRepository.find({
      where: { userId, commentId: In(ids) },
      select: { commentId: true },
    });

    return new Set(rows.map((r) => r.commentId));
  }

  private buildTree(
    comments: Comment[],
    scores: Map<string, number>,
    voted: Set<string>,
  ): PublicComment[] {
    const nodes = new Map<string, PublicComment>();

    for (const comment of comments) {
      nodes.set(
        comment.id,
        this.toPublic(comment, scores.get(comment.id) ?? 0, voted.has(comment.id)),
      );
    }

    const roots: PublicComment[] = [];

    for (const comment of comments) {
      const node = nodes.get(comment.id)!;

      if (comment.parentId) {
        nodes.get(comment.parentId)?.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}