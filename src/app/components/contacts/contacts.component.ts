import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContactsService } from '../../services/contacts.service';
import { Contact, SearchUser } from '../../models/contact.models';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
  private contactsService = inject(ContactsService);

  contacts: Contact[] = [];
  contactsLoading = false;
  searchControl = new FormControl<string>('');
  searchResults: SearchUser[] = [];

  ngOnInit(): void {
    this.loadContacts();
    this.setupSearch();
  }

  private loadContacts() {
    this.contactsLoading = true;
    this.contactsService.getMyContacts().subscribe({
      next: (list) => {
        this.contacts = list;
        this.contactsLoading = false;
      },
      error: () => {
        this.contactsLoading = false;
      },
    });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => (q && q.trim().length > 0 ? this.contactsService.searchUsers(q.trim()) : of([])))
      )
      .subscribe((results) => (this.searchResults = results));
  }

  addContact(user: SearchUser) {
    this.contactsService
      .addContact({ contactUserId: user.id })
      .subscribe((newContact) => {
        this.contacts.push(newContact);
        this.searchControl.setValue('', { emitEvent: true });
        this.searchResults = [];
      });
  }

  removeContact(userId: string) {
    this.contactsService
      .removeContact(userId)
      .subscribe(() => (this.contacts = this.contacts.filter((c) => c.id !== userId)));
  }

  blockUser(userId: string) {
    this.contactsService.blockUser(userId).subscribe();
  }

  unblockUser(userId: string) {
    this.contactsService.unblockUser(userId).subscribe();
  }
}

