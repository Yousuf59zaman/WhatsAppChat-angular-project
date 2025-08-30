import { Profile } from '../models/profile.models';
import { environment } from '../../environments/environment';

export function parseLastSeen(s?: string | null): Date | null {
  return s ? new Date(s) : null;
}

export function toAbsoluteUrl(apiUrl: string, path?: string | null): string | null {
  if (!path) return null;
  const base = new URL(apiUrl);
  return new URL(path, base.origin).toString();
}

export function mapProfile(p: Profile): Profile & { lastSeenDate: Date | null; avatarAbsoluteUrl: string | null } {
  return {
    ...p,
    lastSeenDate: parseLastSeen(p.lastSeen ?? null),
    avatarAbsoluteUrl: toAbsoluteUrl(environment.apiUrl, p.avatarUrl ?? null),
  } as any;
}

