export interface MarkDeliveredDto {
  deliveredAt?: string;
}

export interface MarkReadDto {
  readAt?: string;
}

export interface MessageReceiptDto {
  userId: string;
  deliveredAt?: string;
  readAt?: string;
}

