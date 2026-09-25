
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PostService } from '../../core/post/post.service';
import { FeedPost } from '../../core/types/post.type';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {
  private postService = inject(PostService);
  private auth = inject(AuthService);

  readonly posts = this.postService.posts;
  readonly isLoggedIn = this.auth.isLoggedIn;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.postService.loadFeed().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load posts');
      },
    });
  }

  toggleVote(post: FeedPost): void {
    const request = post.hasVoted
      ? this.postService.unvote(post.id)
      : this.postService.vote(post.id);

    request.subscribe({ error: () => undefined });
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