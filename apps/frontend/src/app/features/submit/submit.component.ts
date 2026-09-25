
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../core/post/post.service';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './submit.component.html',
  styleUrl: './submit.component.css',
})
export class SubmitComponent {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
    url: ['', [Validators.maxLength(2048)]],
    body: ['', [Validators.maxLength(20000)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, url, body } = this.form.getRawValue();
    const trimmedUrl = url.trim();
    const trimmedBody = body.trim();

    if (!trimmedUrl && !trimmedBody) {
      this.error.set('Provide either a link or some text');
      return;
    }

    if (trimmedUrl && trimmedBody) {
      this.error.set('A post can have a link or text, not both');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.postService
      .create({
        title: title.trim(),
        url: trimmedUrl || undefined,
        body: trimmedBody || undefined,
      })
      .subscribe({
        next: ({ id }) => this.router.navigate(['/post', id]),
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(
            err.status === 400
              ? 'Check the link is a valid URL starting with http'
              : 'Could not submit',
          );
        },
      });
  }
}