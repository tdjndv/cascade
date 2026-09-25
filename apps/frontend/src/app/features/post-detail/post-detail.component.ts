// apps/frontend/src/app/features/post-detail/post-detail.component.ts
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommentService } from '../../core/comment/comment.service';
import { PostService } from '../../core/post/post.service';
import { FeedPost } from '../../core/types/post.type';
import { CommentNodeComponent } from '../../shared/comment-node/comment-node.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, CommentNodeComponent],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css',
})
export class PostDetailComponent {
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private auth = inject(AuthService);

  readonly id = input.required<string>();

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly comments = this.commentService.comments;

  readonly post = signal<FeedPost | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly commentBody = signal('');
  readonly saving = signal(false);

  constructor() {
    effect(() => {
      const postId = this.id();

      this.commentService.clear();
      this.post.set(null);
      this.loading.set(true);
      this.error.set(null);

      this.postService.findOne(postId).subscribe({
        next: (post) => {
          this.post.set(post);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Post not found');
        },
      });

      this.commentService.load(postId).subscribe({ error: () => undefined });
    });
  }

  toggleVote(): void {
    const current = this.post();
    if (!current) return;

    const request = current.hasVoted
      ? this.postService.unvote(current.id)
      : this.postService.vote(current.id);

    request.subscribe({
      next: ({ score }) =>
        this.post.update((p) => (p ? { ...p, score, hasVoted: !p.hasVoted } : p)),
      error: () => undefined,
    });
  }

  submitComment(): void {
    const body = this.commentBody().trim();
    if (!body || this.saving()) return;

    this.saving.set(true);

    this.commentService.create(this.id(), { body }).subscribe({
      next: () => {
        this.saving.set(false);
        this.commentBody.set('');
      },
      error: () => this.saving.set(false),
    });
  }

  hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  timeAgo(iso: string): string {
    const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

    const units: [number, string][] = [
      [31536000, 'year'],
      [2592000, 'month'],
      [86400, 'day'],
      [3600, 'hour'],
      [60, 'minute'],
    ];

    for (const [size, name] of units) {
      const value = Math.floor(seconds / size);
      if (value >= 1) return `${value} ${name}${value === 1 ? '' : 's'} ago`;
    }

    return 'just now';
  }
}