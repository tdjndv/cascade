import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../comments/comment.entity';
import { Post } from '../posts/post.entity';
import { CommentVote } from '../votes/comment-vote.entity';
import { PostVote } from '../votes/post-vote.entity';
import { User } from './user.entity';
import { PublicUser, UserProfile } from '../type/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(PostVote)
    private readonly postVoteRepository: Repository<PostVote>,

    @InjectRepository(CommentVote)
    private readonly commentVoteRepository: Repository<CommentVote>,
  ) {}

  async create(
    email: string,
    username: string,
    passwordHash: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      email: this.normalize(email),
      username: username.trim().toLowerCase(),
      passwordHash,
    });

    try {
      return await this.userRepository.save(user);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
        const message = (err as { sqlMessage?: string }).sqlMessage ?? '';
        throw new ConflictException(
          message.includes('username')
            ? 'That username is taken'
            : 'That email is already registered',
        );
      }
      throw err;
    }
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByUsernameOrFail(username: string): Promise<User> {
    const user = await this.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmailOrUsername(identifier: string): Promise<User | null> {
    const value = identifier.trim();

    return this.userRepository.findOne({
      where: [
        { email: value.toLowerCase() },
        { username: value.toLowerCase() },
      ],
    });
  }

  async getKarma(userId: string): Promise<number> {
    const [postKarma, commentKarma] = await Promise.all([
      this.postVoteRepository
        .createQueryBuilder('v')
        .innerJoin('v.post', 'p')
        .where('p.userId = :userId', { userId })
        .getCount(),

      this.commentVoteRepository
        .createQueryBuilder('v')
        .innerJoin('v.comment', 'c')
        .where('c.userId = :userId', { userId })
        .getCount(),
    ]);

    return postKarma + commentKarma;
  }

  async getProfile(username: string): Promise<UserProfile> {
    const user = await this.findByUsernameOrFail(username);

    const [karma, postCount, commentCount] = await Promise.all([
      this.getKarma(user.id),
      this.postRepository.count({ where: { userId: user.id } }),
      this.commentRepository.count({ where: { userId: user.id } }),
    ]);

    return { ...this.toPublic(user), karma, postCount, commentCount };
  }

  toPublic(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}
