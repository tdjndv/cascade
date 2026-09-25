import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { Comment } from '../comments/comment.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 254 })
  email: string;

  @Index('uq_users_username', { unique: true })
  @Column({ length: 30 })
  username: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @CreateDateColumn({ precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ precision: 6 })
  updatedAt: Date;
}
