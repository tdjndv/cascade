import { Post } from '../posts/post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CommentVote } from '../votes/comment-vote.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  body: string;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  postId: string;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({ type: 'varchar', length: 36, nullable: true })
  parentId: string | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  @OneToMany(() => CommentVote, (vote) => vote.comment)
  votes: CommentVote[];

  @DeleteDateColumn({ precision: 6, nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ precision: 6 })
  updatedAt: Date;
}
