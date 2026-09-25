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

import { Comment } from '../comments/comment.entity';

@Entity('comment_votes')
@Unique('uq_comment_votes_user_comment', ['userId', 'commentId'])
export class CommentVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  commentId: string;

  @ManyToOne(() => Comment, (comment) => comment.votes, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'commentId' })
  comment: Comment;

  @CreateDateColumn({ precision: 6 })
  createdAt: Date;
}
