import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

import { Comment } from '../comments/comment.entity';
import { PostVote } from '../votes/post-vote.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  url: string | null;

  @Column({ type: 'text', nullable: true })
  body: string | null;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostVote, (vote) => vote.post)
  votes: PostVote[];

  @Index()
  @CreateDateColumn({ precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ precision: 6 })
  updatedAt: Date;
}
