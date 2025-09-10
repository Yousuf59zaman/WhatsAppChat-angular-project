import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MarkDeliveredDto, MarkReadDto, MessageReceiptDto } from '../models/receipts.models';

@Injectable({ providedIn: 'root' })
export class MessagesReceiptsService {
  private readonly http = inject(HttpClient);
  // Ensure no trailing slash on base; environment.apiBaseUrl already includes "/api" here
  private readonly base = `${(environment.apiBaseUrl ?? '').replace(/\/+$/, '')}/messages`;

  markDelivered(messageId: string, dto: MarkDeliveredDto = {}): Observable<MessageReceiptDto> {
    const url = `${this.base}/${encodeURIComponent(messageId)}/delivered`;
    return this.http.post<MessageReceiptDto>(url, dto).pipe(catchError(this.handleError));
  }

  markRead(messageId: string, dto: MarkReadDto = {}): Observable<MessageReceiptDto> {
    const url = `${this.base}/${encodeURIComponent(messageId)}/read`;
    return this.http.post<MessageReceiptDto>(url, dto).pipe(catchError(this.handleError));
  }

  getReceipts(messageId: string): Observable<MessageReceiptDto[]> {
    const url = `${this.base}/${encodeURIComponent(messageId)}/receipts`;
    return this.http.get<MessageReceiptDto[]>(url).pipe(catchError(this.handleError));
  }

  private handleError = (error: any) => {
    // Mirror lightweight error handling used elsewhere in the app
    const message =
      (error?.error && (typeof error.error === 'string' ? error.error : error.error?.message)) ||
      error?.message ||
      'Request failed';
    throw new Error(message);
  };
}

