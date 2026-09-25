// apps/backend/src/app/posts/post.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Comment } from '../comments/comment.entity';
import { UserService } from '../users/user.service';
import { PostVote } from '../votes/post-vote.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';
import { FeedPost, PublicPost } from '../type/post.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly userService: UserService,
  ) {}

  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    const url = dto.url?.trim() || null;
    const body = dto.body?.trim() || null;

    if (!url && !body) {
      throw new BadRequestException('Provide either a url or some text');
    }

    if (url && body) {
      throw new BadRequestException('A post can have a url or text, not both');
    }

    const post = this.postRepository.create({
      title: dto.title.trim(),
      url,
      body,
      userId,
    });

    return this.postRepository.save(post);
  }

  async findOneOrFail(id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findOneWithStats(id: string, viewerId?: string): Promise<FeedPost> {
    const post = await this.findOneOrFail(id);
    const [decorated] = await this.decorate([post], viewerId);
    return decorated;
  }

  async findFeed(
    page: number,
    limit: number,
    author?: string,
    viewerId?: string,
  ): Promise<{ items: FeedPost[]; total: number }> {
    const userId = author
      ? (await this.userService.findByUsernameOrFail(author)).id
      : undefined;

    const [posts, total] = await this.postRepository.findAndCount({
      where: userId ? { userId } : {},
      relations: { user: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items: await this.decorate(posts, viewerId), total };
  }

  toPublic(post: Post): PublicPost {
    return {
      id: post.id,
      title: post.title,
      url: post.url,
      body: post.body,
      author: this.userService.toPublic(post.user),
      createdAt: post.createdAt.toISOString(),
    };
  }

  private async decorate(posts: Post[], viewerId?: string): Promise<FeedPost[]> {
    const ids = posts.map((p) => p.id);

    const [scores, commentCounts, voted] = await Promise.all([
      this.countBy(this.postVoteRepository, ids),
      this.countBy(this.commentRepository, ids),
      viewerId ? this.findVotedIds(viewerId, ids) : Promise.resolve(new Set<string>()),
    ]);

    return posts.map((post) => ({
      ...this.toPublic(post),
      score: scores.get(post.id) ?? 0,
      commentCount: commentCounts.get(post.id) ?? 0,
      hasVoted: voted.has(post.id),
    }));
  }

  private async countBy(
    repo: Repository<PostVote> | Repository<Comment>,
    ids: string[],
  ): Promise<Map<string, number>> {
    if (ids.length === 0) return new Map();

    const rows = await repo
      .createQueryBuilder('r')
      .select('r.postId', 'key')
      .addSelect('COUNT(*)', 'count')
      .where('r.postId IN (:...ids)', { ids })
      .groupBy('r.postId')
      .getRawMany<{ key: string; count: string }>();

    return new Map(rows.map((r) => [r.key, Number(r.count)]));
  }

  private async findVotedIds(userId: string, ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();

    const rows = await this.postVoteRepository.find({
      where: { userId, postId: In(ids) },
      select: { postId: true },
    });

    return new Set(rows.map((r) => r.postId));
  }
}