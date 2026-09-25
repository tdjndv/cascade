// apps/frontend/src/app/core/post/post.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Feed, FeedPost, PublicPost } from '../types/post.type';

export type CreatePostPayload = {
  title: string;
  url?: string;
  body?: string;
};

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);

  readonly posts = signal<FeedPost[]>([]);
  readonly total = signal(0);

  loadFeed(page = 1, limit = 30): Observable<Feed> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<Feed>('/api/posts', { params }).pipe(
      tap((feed) => {
        this.posts.set(feed.items);
        this.total.set(feed.total);
      }),
    );
  }

  findOne(id: string): Observable<FeedPost> {
  return this.http.get<FeedPost>(`/api/posts/${id}`);
}

  create(payload: CreatePostPayload): Observable<{ id: string }> {
    return this.http.post<{ id: string }>('/api/posts', payload);
  }

  vote(id: string): Observable<{ score: number }> {
    return this.http
      .post<{ score: number }>(`/api/posts/${id}/vote`, {})
      .pipe(tap(({ score }) => this.applyVote(id, score, true)));
  }

  unvote(id: string): Observable<{ score: number }> {
    return this.http
      .delete<{ score: number }>(`/api/posts/${id}/vote`)
      .pipe(tap(({ score }) => this.applyVote(id, score, false)));
  }

  private applyVote(id: string, score: number, hasVoted: boolean): void {
    this.posts.update((list) =>
      list.map((post) => (post.id === id ? { ...post, score, hasVoted } : post)),
    );
  }
}