
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/user/user.service';
import { UserComment } from '../../core/types/comment.type';
import { FeedPost } from '../../core/types/post.type';
import { UserProfile } from '../../core/types/user.type';

type Tab = 'posts' | 'comments';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  private userService = inject(UserService);

  readonly username = input.required<string>();

  readonly profile = signal<UserProfile | null>(null);
  readonly posts = signal<FeedPost[]>([]);
  readonly comments = signal<UserComment[]>([]);

  readonly tab = signal<Tab>('posts');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const name = this.username();

      this.loading.set(true);
      this.error.set(null);
      this.profile.set(null);
      this.posts.set([]);
      this.comments.set([]);
      this.tab.set('posts');

      this.userService.getProfile(name).subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('User not found');
        },
      });

      this.userService.getPosts(name).subscribe({
        next: (feed) => this.posts.set(feed.items),
        error: () => undefined,
      });

      this.userService.getComments(name).subscribe({
        next: (page) => this.comments.set(page.items),
        error: () => undefined,
      });
    });
  }

  joined(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }
}