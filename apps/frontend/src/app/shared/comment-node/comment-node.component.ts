
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommentService } from '../../core/comment/comment.service';
import { PublicComment } from '../../core/types/comment.type';

@Component({
  selector: 'app-comment-node',
  standalone: true,
  imports: [RouterLink, FormsModule, CommentNodeComponent],
  templateUrl: './comment-node.component.html',
  styleUrl: './comment-node.component.css',
})
export class CommentNodeComponent {
  private commentService = inject(CommentService);
  private auth = inject(AuthService);

  readonly comment = input.required<PublicComment>();
  readonly postId = input.required<string>();

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly currentUsername = this.auth.username;

  readonly collapsed = signal(false);
  readonly replying = signal(false);
  readonly replyBody = signal('');
  readonly saving = signal(false);

  toggleVote(): void {
    const c = this.comment();

    const request = c.hasVoted
      ? this.commentService.unvote(c.id)
      : this.commentService.vote(c.id);

    request.subscribe({ error: () => undefined });
  }

  submitReply(): void {
    const body = this.replyBody().trim();
    if (!body || this.saving()) return;

    this.saving.set(true);

    this.commentService
      .create(this.postId(), { body, parentId: this.comment().id })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.replying.set(false);
          this.replyBody.set('');
        },
        error: () => this.saving.set(false),
      });
  }

  remove(): void {
    this.commentService.remove(this.comment().id).subscribe({
      error: () => undefined,
    });
  }

  replyCount(): number {
    const count = (nodes: PublicComment[]): number =>
      nodes.reduce((sum, node) => sum + 1 + count(node.replies), 0);

    return count(this.comment().replies);
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