
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PublicComment } from '../types/comment.type';

export type CreateCommentPayload = {
  body: string;
  parentId?: string;
};

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  readonly comments = signal<PublicComment[]>([]);

  load(postId: string): Observable<PublicComment[]> {
    return this.http
      .get<PublicComment[]>(`/api/posts/${postId}/comments`)
      .pipe(tap((tree) => this.comments.set(tree)));
  }

  create(postId: string, payload: CreateCommentPayload): Observable<PublicComment> {
    return this.http
      .post<PublicComment>(`/api/posts/${postId}/comments`, payload)
      .pipe(tap((created) => this.insert(created, payload.parentId)));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`/api/comments/${id}`)
      .pipe(tap(() => this.markDeleted(id)));
  }

  vote(id: string): Observable<{ score: number }> {
    return this.http
      .post<{ score: number }>(`/api/comments/${id}/vote`, {})
      .pipe(tap(({ score }) => this.patch(id, { score, hasVoted: true })));
  }

  unvote(id: string): Observable<{ score: number }> {
    return this.http
      .delete<{ score: number }>(`/api/comments/${id}/vote`)
      .pipe(tap(({ score }) => this.patch(id, { score, hasVoted: false })));
  }

  clear(): void {
    this.comments.set([]);
  }

  // if find then spread changes, otherwise recurse to subtree
  private patch(id: string, change: Partial<PublicComment>): void {
    const walk = (nodes: PublicComment[]): PublicComment[] =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, ...change, replies: node.replies }
          : { ...node, replies: walk(node.replies) },
      );

    this.comments.update(walk);
  }

  private markDeleted(id: string): void {
    this.patch(id, { body: '[deleted]', author: null, deleted: true });
  }

  private insert(comment: PublicComment, parentId?: string): void {
    if (!parentId) {
      this.comments.update((tree) => [...tree, comment]);
      return;
    }

    const walk = (nodes: PublicComment[]): PublicComment[] =>
      nodes.map((node) =>
        node.id === parentId
          ? { ...node, replies: [...node.replies, comment] }
          : { ...node, replies: walk(node.replies) },
      );

    this.comments.update(walk);
  }
}