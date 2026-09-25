
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserComment } from '../types/comment.type';
import { Feed } from '../types/post.type';
import { UserProfile } from '../types/user.type';

export type CommentPage = {
  items: UserComment[];
  total: number;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`/api/users/${username}`);
  }

  getPosts(username: string, page = 1, limit = 30): Observable<Feed> {
    const params = new HttpParams()
      .set('author', username)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<Feed>('/api/posts', { params });
  }

  getComments(username: string, page = 1, limit = 30): Observable<CommentPage> {
    const params = new HttpParams()
      .set('author', username)
      .set('page', page)
      .set('limit', limit);

    return this.http.get<CommentPage>('/api/comments', { params });
  }
}