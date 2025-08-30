import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Profile, UpdatePrivacyRequest, UpdateProfileRequest } from '../../models/profile.models';
import { mapProfile } from '../../utils/profile.utils';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  profile$!: Observable<ReturnType<typeof mapProfile>>;
  error: string | null = null;
  saving = false;
  privacySaving = false;
  uploading = false;

  form = this.fb.group({
    displayName: ['', [Validators.required]],
    about: [''],
  });

  privacyForm = this.fb.group({
    lastSeenPrivacy: this.fb.control<'Everyone' | 'Nobody'>('Everyone'),
  });

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.profile$ = this.profileService.getMyProfile().pipe(
      map((p) => {
        // seed forms
        this.form.patchValue({ displayName: p.displayName ?? '', about: p.about ?? '' }, { emitEvent: false });
        this.privacyForm.patchValue({ lastSeenPrivacy: p.lastSeenPrivacy }, { emitEvent: false });
        return mapProfile(p);
      })
    );
  }

  saveProfile() {
    if (this.form.invalid) return;
    const payload: UpdateProfileRequest = {
      displayName: this.form.value.displayName!,
      about: this.form.value.about ?? null,
    };
    this.saving = true;
    this.error = null;
    this.profile$ = this.profileService.updateProfile(payload).pipe(
      switchMap(() => this.profileService.getMyProfile()),
      map(mapProfile)
    );
    this.saving = false;
  }

  savePrivacy() {
    const payload: UpdatePrivacyRequest = { lastSeenPrivacy: this.privacyForm.value.lastSeenPrivacy! };
    this.privacySaving = true;
    this.error = null;
    this.profile$ = this.profileService.updatePrivacy(payload).pipe(
      switchMap(() => this.profileService.getMyProfile()),
      map(mapProfile)
    );
    this.privacySaving = false;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading = true;
    this.profile$ = this.profileService
      .uploadAvatar(file)
      .pipe(switchMap(() => this.profileService.getMyProfile()), map(mapProfile));
    this.uploading = false;
    input.value = '';
  }

  logout() {
    this.auth.logout();
  }
}
