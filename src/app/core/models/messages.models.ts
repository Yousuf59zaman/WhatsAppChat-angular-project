export enum MessageType {
  Text = 0,
  Attachment = 1,
}

export interface MessageAttachmentDto {
  id: string;
  fileName: string;
  url: string;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  thumbnailUrl?: string | null;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  body?: string | null;
  type: MessageType;
  replyToMessageId?: string | null;
  createdAt: string;
  editedAt?: string | null;
  isDeletedForEveryone: boolean;
  attachments: MessageAttachmentDto[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface SendMessageDto {
  conversationId: string;
  body: string;
  replyToMessageId?: string;
}

export interface EditMessageDto {
  body: string;
}

