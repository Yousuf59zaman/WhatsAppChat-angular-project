export interface Contact {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  alias: string | null;
}

export interface CreateContactRequest {
  contactUserId: string;
  alias?: string | null;
}

export interface SearchUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

