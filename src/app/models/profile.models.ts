export type LastSeenPrivacy = 'Everyone' | 'Nobody';

export interface Profile {
  id: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  about?: string | null;
  lastSeen?: string | null;
  lastSeenPrivacy: LastSeenPrivacy;
}

export interface UpdateProfileRequest {
  displayName: string;
  about?: string | null;
}

export interface UpdatePrivacyRequest {
  lastSeenPrivacy: LastSeenPrivacy;
}

export interface AvatarUploadResult {
  avatarUrl: string;
}

