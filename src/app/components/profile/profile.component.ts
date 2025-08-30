import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  me: any = null;
  error: string | null = null;

  ngOnInit(): void {
    this.http.get(`${environment.apiUrl}/Profile/me`).subscribe({
      next: (res) => (this.me = res),
      error: (err) => (this.error = err?.error?.message || 'Failed to load profile'),
    });
  }

  logout() {
    this.auth.logout();
  }
}

