import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Entity('post_votes')
@Unique('uq_post_votes_user_post', ['userId', 'postId'])
export class PostVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  postId: string;

  @ManyToOne(() => Post, (post) => post.votes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @CreateDateColumn({ precision: 6 })
  createdAt: Date;
}
