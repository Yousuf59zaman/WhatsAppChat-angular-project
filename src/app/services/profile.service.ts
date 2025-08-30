import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AvatarUploadResult, Profile, UpdatePrivacyRequest, UpdateProfileRequest } from '../models/profile.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${environment.apiUrl}/Profile/me`);
  }

  getUserProfile(userId: string): Observable<Profile> {
    return this.http.get<Profile>(`${environment.apiUrl}/Profile/${encodeURIComponent(userId)}`);
  }

  updateProfile(payload: UpdateProfileRequest): Observable<Profile> {
    return this.http.put<Profile>(`${environment.apiUrl}/Profile`, payload);
  }

  updatePrivacy(payload: UpdatePrivacyRequest): Observable<Profile> {
    return this.http.put<Profile>(`${environment.apiUrl}/Profile/privacy`, payload);
  }

  uploadAvatar(file: File): Observable<AvatarUploadResult> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<AvatarUploadResult>(`${environment.apiUrl}/Profile/avatar`, fd);
  }
}

