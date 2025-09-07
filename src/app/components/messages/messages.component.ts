import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '../../core/services/messages.service';
import { MessageDto, MessageType, PagedResult } from '../../core/models/messages.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss',
})
export class MessagesComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private svc = inject(MessagesService);

  conversationId = signal<string>('');
  messages = signal<MessageDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  pageSize = 20;

  // compose
  textBody = '';
  filesToSend: File[] = [];
  replyToMessageId: string | undefined;

  // edit state
  editingId: string | null = null;
  editBody = '';

  hasMoreOlder = computed(() => (this.messages().length % this.pageSize === 0) && this.messages().length > 0);

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((p) => {
      const id = p.get('conversationId');
      if (!id) return;
      this.conversationId.set(id);
      this.messages.set([]);
      this.loadInitial();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadInitial(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc
      .getByConversation(this.conversationId(), { page: 1, size: this.pageSize })
      .subscribe({
        next: (res: PagedResult<MessageDto>) => {
          // assume API returns newest first or server-defined order; keep as-is
          this.messages.set(res.items);
        },
        error: (err) => this.error.set(err?.message || 'Failed to load messages'),
        complete: () => this.loading.set(false),
      });
  }

  loadOlder(): void {
    if (this.messages().length === 0) return;
    const oldest = this.messages().reduce((min, m) => (m.createdAt < min.createdAt ? m : min));
    this.loading.set(true);
    this.svc
      .getByConversation(this.conversationId(), { size: this.pageSize, before: oldest.createdAt })
      .subscribe({
        next: (res) => this.messages.update((arr) => [...arr, ...res.items]),
        error: (err) => this.error.set(err?.message || 'Failed to load older'),
        complete: () => this.loading.set(false),
      });
  }

  sendText(): void {
    const body = (this.textBody || '').trim();
    if (!body) return;
    this.loading.set(true);
    this.svc
      .send({ conversationId: this.conversationId(), body, replyToMessageId: this.replyToMessageId })
      .subscribe({
        next: (msg) => {
          this.messages.update((arr) => [msg, ...arr]);
          this.textBody = '';
          this.replyToMessageId = undefined;
        },
        error: (err) => this.error.set(err?.message || 'Send failed'),
        complete: () => this.loading.set(false),
      });
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filesToSend = Array.from(input.files || []);
  }

  sendFiles(): void {
    if (!this.filesToSend.length) return;
    this.loading.set(true);
    this.svc
      .sendAttachments(this.conversationId(), this.filesToSend, this.textBody || undefined, this.replyToMessageId)
      .subscribe({
        next: (msg) => {
          this.messages.update((arr) => [msg, ...arr]);
          this.textBody = '';
          this.replyToMessageId = undefined;
          this.filesToSend = [];
          const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
          if (fileInput) fileInput.value = '';
        },
        error: (err) => this.error.set(err?.message || 'Upload failed (max 50MB)'),
        complete: () => this.loading.set(false),
      });
  }

  startEdit(m: MessageDto) {
    this.editingId = m.id;
    this.editBody = (m.body ?? '').toString();
  }

  cancelEdit() {
    this.editingId = null;
    this.editBody = '';
  }

  saveEdit(m: MessageDto) {
    const id = m.id;
    const body = this.editBody.trim();
    if (!body) return;
    this.loading.set(true);
    this.svc.edit(id, { body }).subscribe({
      next: (updated) => {
        this.messages.update((arr) => arr.map((x) => (x.id === id ? updated : x)));
        this.cancelEdit();
      },
      error: (err) => this.error.set(err?.message || 'Edit failed'),
      complete: () => this.loading.set(false),
    });
  }

  deleteForMe(m: MessageDto) {
    this.loading.set(true);
    this.svc.deleteForMe(m.id).subscribe({
      next: () => this.messages.update((arr) => arr.filter((x) => x.id !== m.id)),
      error: (err) => this.error.set(err?.message || 'Delete failed'),
      complete: () => this.loading.set(false),
    });
  }

  deleteForEveryone(m: MessageDto) {
    this.loading.set(true);
    this.svc.deleteForEveryone(m.id).subscribe({
      next: () => this.messages.update((arr) => arr.filter((x) => x.id !== m.id)),
      error: (err) => this.error.set(err?.message || 'Delete for everyone may be time-limited'),
      complete: () => this.loading.set(false),
    });
  }

  isAttachment(m: MessageDto): boolean {
    return m.type === MessageType.Attachment;
  }
}

