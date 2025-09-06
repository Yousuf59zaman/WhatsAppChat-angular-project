import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contact, CreateContactRequest, SearchUser } from '../models/contact.models';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/Contacts`;

  getMyContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.base);
  }

  searchUsers(query: string): Observable<SearchUser[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<SearchUser[]>(`${this.base}/search`, { params });
  }

  addContact(payload: CreateContactRequest): Observable<Contact> {
    return this.http.post<Contact>(this.base, payload);
  }

  removeContact(contactUserId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(contactUserId)}`);
  }

  blockUser(blockedUserId: string): Observable<void> {
    return this.http.post<void>(`${this.base}/block/${encodeURIComponent(blockedUserId)}`, {});
  }

  unblockUser(blockedUserId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/block/${encodeURIComponent(blockedUserId)}`);
  }
}

