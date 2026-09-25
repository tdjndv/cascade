
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent {
  private auth = inject(AuthService);

  readonly isLoggedIn = this.auth.isLoggedIn;
  readonly username = this.auth.username;

  signOut(): void {
    this.auth.signOut();
  }
}