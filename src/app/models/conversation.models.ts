export interface Conversation {
  id: string;
  isGroup: boolean;
  title: string | null;
  photoUrl: string | null;
}

export interface CreateOneToOneRequest {
  otherUserId: string;
}

export interface CreateGroupRequest {
  title: string | null;
  photoUrl?: string | null;
  memberIds: string[];
}

export interface UpdateGroupInfoRequest {
  title: string | null;
  photoUrl?: string | null;
}

export interface AddMembersRequest {
  userIds: string[];
}

