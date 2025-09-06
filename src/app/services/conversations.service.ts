import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AddMembersRequest,
  Conversation,
  CreateGroupRequest,
  CreateOneToOneRequest,
  UpdateGroupInfoRequest,
} from '../models/conversation.models';

@Injectable({ providedIn: 'root' })
export class ConversationsService {
  private http = inject(HttpClient);

  // Supports apiBaseUrl that may or may not already include "/api"
  private readonly base = (() => {
    const root = (environment.apiBaseUrl ?? '').replace(/\/+$/, '');
    const prefix = root.toLowerCase().endsWith('/api') ? '' : '/api';
    return `${root}${prefix}/Conversations`;
  })();

  private readonly jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  getMyConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.base);
  }

  getById(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/${encodeURIComponent(id)}`);
  }

  createOneToOne(payload: CreateOneToOneRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.base}/one-to-one`, payload, {
      headers: this.jsonHeaders,
    });
  }

  createGroup(payload: CreateGroupRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.base}/group`, payload, {
      headers: this.jsonHeaders,
    });
  }

  updateGroupInfo(id: string, payload: UpdateGroupInfoRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${encodeURIComponent(id)}`, payload, {
      headers: this.jsonHeaders,
    });
  }

  addMembers(id: string, payload: AddMembersRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/${encodeURIComponent(id)}/members`, payload, {
      headers: this.jsonHeaders,
    });
  }

  removeMember(id: string, userId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`
    );
  }

  leave(id: string): Observable<void> {
    return this.http.post<void>(`${this.base}/${encodeURIComponent(id)}/leave`, {}, {
      headers: this.jsonHeaders,
    });
  }

  pin(id: string, isPinned: boolean): Observable<void> {
    return this.http.post<void>(
      `${this.base}/${encodeURIComponent(id)}/pin?isPinned=${encodeURIComponent(String(isPinned))}`,
      {},
      { headers: this.jsonHeaders }
    );
  }

  mute(id: string, isMuted: boolean): Observable<void> {
    return this.http.post<void>(
      `${this.base}/${encodeURIComponent(id)}/mute?isMuted=${encodeURIComponent(String(isMuted))}`,
      {},
      { headers: this.jsonHeaders }
    );
  }
}
