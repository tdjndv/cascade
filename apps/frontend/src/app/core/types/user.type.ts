export type PublicUser = {
  id: string;
  username: string;
  createdAt: string;
};

export type UserProfile = PublicUser & {
  karma: number;
  postCount: number;
  commentCount: number;
};