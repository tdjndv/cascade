import { PublicUser } from './user.type';

export type PublicPost = {
  id: string;
  title: string;
  url: string | null;
  body: string | null;
  author: PublicUser;
  createdAt: string;
};

export type FeedPost = PublicPost & {
  score: number;
  commentCount: number;
  hasVoted: boolean;
};