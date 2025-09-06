import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConversationsService } from '../../services/conversations.service';
import { Conversation } from '../../models/conversation.models';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './conversations.component.html',
  styleUrl: './conversations.component.scss',
})
export class ConversationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ConversationsService);

  loading = signal(false);
  error = signal<string | null>(null);

  conversations = signal<Conversation[]>([]);
  selectedId = signal<string | null>(null);
  selected = computed(() =>
    this.conversations().find((c) => c.id === this.selectedId()) || null
  );

  // Forms
  oneToOneForm = this.fb.group({
    otherUserId: ['', [Validators.required]],
  });

  createGroupForm = this.fb.group({
    title: ['', []],
    photoUrl: ['', []],
    memberIdsCsv: ['', []],
  });

  updateGroupForm = this.fb.group({
    title: ['', []],
    photoUrl: ['', []],
  });

  addMembersForm = this.fb.group({
    userIdsCsv: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .getMyConversations()
      .pipe(
        tap((list) => this.conversations.set(list)),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Failed to load conversations');
          return of([] as Conversation[]);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  select(conv: Conversation) {
    this.selectedId.set(conv.id);
    if (conv.isGroup) {
      this.updateGroupForm.patchValue({
        title: conv.title ?? '',
        photoUrl: conv.photoUrl ?? '',
      });
    }
  }

  createOneToOne() {
    if (this.oneToOneForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const payload = { otherUserId: this.oneToOneForm.value.otherUserId! };
    this.svc
      .createOneToOne(payload)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Create 1:1 failed');
          return of(null);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  createGroup() {
    const ids = (this.createGroupForm.value.memberIdsCsv || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: this.createGroupForm.value.title || null,
      photoUrl: this.createGroupForm.value.photoUrl || null,
      memberIds: ids,
    };
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .createGroup(payload)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Create group failed');
          return of(null);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  updateGroupInfo() {
    const sel = this.selected();
    if (!sel) return;
    const payload = {
      title: this.updateGroupForm.value.title || null,
      photoUrl: this.updateGroupForm.value.photoUrl || null,
    };
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .updateGroupInfo(sel.id, payload)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Update group failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  addMembers() {
    const sel = this.selected();
    if (!sel) return;
    const ids = (this.addMembersForm.value.userIdsCsv || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .addMembers(sel.id, { userIds: ids })
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Add members failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  removeMember(userId: string) {
    const sel = this.selected();
    if (!sel) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .removeMember(sel.id, userId)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Remove member failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  leave() {
    const sel = this.selected();
    if (!sel) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .leave(sel.id)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Leave failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  pin(val: boolean) {
    const sel = this.selected();
    if (!sel) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .pin(sel.id, val)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Pin failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  mute(val: boolean) {
    const sel = this.selected();
    if (!sel) return;
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .mute(sel.id, val)
      .pipe(
        tap(() => this.refresh()),
        catchError((err) => {
          this.error.set(err?.error?.message || 'Mute failed');
          return of(void 0);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }
}

