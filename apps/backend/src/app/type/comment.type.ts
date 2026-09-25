// apps/backend/src/app/comments/comment.type.ts
import { PublicUser } from '../type/user.type';

export type PublicComment = {
  id: string;
  body: string;
  author: PublicUser | null;
  deleted: boolean;
  score: number;
  hasVoted: boolean;
  createdAt: string;
  replies: PublicComment[];
};

export type UserComment = PublicComment & {
  post: { id: string; title: string };
};