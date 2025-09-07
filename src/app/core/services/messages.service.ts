import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  EditMessageDto,
  MessageDto,
  PagedResult,
  SendMessageDto,
} from '../models/messages.models';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${(environment.apiUrl ?? '').replace(/\/+$/, '')}/messages`;

  getByConversation(
    conversationId: string,
    opts?: { page?: number; size?: number; before?: string; after?: string }
  ): Observable<PagedResult<MessageDto>> {
    let params = new HttpParams();
    if (opts?.page !== undefined) params = params.set('page', String(opts.page));
    if (opts?.size !== undefined) params = params.set('size', String(opts.size));
    if (opts?.before !== undefined) params = params.set('before', opts.before);
    if (opts?.after !== undefined) params = params.set('after', opts.after);

    const url = `${this.base}/conversation/${encodeURIComponent(conversationId)}`;
    return this.http
      .get<PagedResult<MessageDto>>(url, { params })
      .pipe(catchError(this.handleError));
  }

  getById(messageId: string): Observable<MessageDto> {
    const url = `${this.base}/${encodeURIComponent(messageId)}`;
    return this.http.get<MessageDto>(url).pipe(catchError(this.handleError));
  }

  send(dto: SendMessageDto): Observable<MessageDto> {
    return this.http
      .post<MessageDto>(this.base, dto)
      .pipe(catchError(this.handleError));
  }

  sendAttachments(
    conversationId: string,
    files: File[],
    body?: string,
    replyToMessageId?: string
  ): Observable<MessageDto> {
    const form = new FormData();
    form.append('conversationId', conversationId);
    files.forEach((f) => form.append('files', f, f.name));
    if (body) form.append('body', body);
    if (replyToMessageId) form.append('replyToMessageId', replyToMessageId);

    const url = `${this.base}/attachments`;
    return this.http
      .post<MessageDto>(url, form)
      .pipe(catchError(this.handleError));
  }

  edit(messageId: string, dto: EditMessageDto): Observable<MessageDto> {
    const url = `${this.base}/${encodeURIComponent(messageId)}`;
    return this.http.put<MessageDto>(url, dto).pipe(catchError(this.handleError));
  }

  deleteForMe(messageId: string): Observable<void> {
    const url = `${this.base}/${encodeURIComponent(messageId)}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }

  deleteForEveryone(messageId: string): Observable<void> {
    const url = `${this.base}/${encodeURIComponent(messageId)}/everyone`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }

  private handleError = (error: HttpErrorResponse) => {
    const message =
      (error?.error && (typeof error.error === 'string' ? error.error : error.error?.message)) ||
      error?.message ||
      'Request failed';
    return throwError(() => new Error(message));
  };
}

