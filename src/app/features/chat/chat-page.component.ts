import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ChatUiService } from '../../core/services/chat-ui.service';
import { SchoolChatApiService, type ChatMessage } from './school-chat-api.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);
  protected readonly chatUi = inject(ChatUiService);
  private readonly chatApi = inject(SchoolChatApiService);

  private readonly destroy$ = new Subject<void>();

  peerId: string | null = null;
  peerKind: 'teacher' | 'student' | null = null;
  peerDisplayName = '';

  conversationId: string | null = null;
  messages: ChatMessage[] = [];
  draft = '';
  loading = false;
  loadError: string | null = null;
  sendError: string | null = null;
  sending = false;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params) => {
          const peer = params.get('peer');
          const kind = params.get('kind');
          this.peerId = peer?.trim() || null;
          this.peerKind = kind === 'teacher' || kind === 'student' ? kind : null;
          const nameQ = params.get('name')?.trim();
          const rec =
            this.peerId && this.peerKind
              ? this.chatUi
                  .readRecent()
                  .find((e) => e.peerId === this.peerId && e.kind === this.peerKind)
              : undefined;
          this.peerDisplayName =
            nameQ ||
            rec?.displayName ||
            (this.peerKind === 'teacher' ? 'Teacher' : this.peerKind === 'student' ? 'Student' : '');

          return this.loadMessages$();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMessages$(): Observable<void> {
    const u = this.auth.currentUser();
    if (!u?.id || !this.peerId || !this.peerKind) {
      this.conversationId = null;
      this.messages = [];
      this.loading = false;
      this.loadError = null;
      return of(undefined);
    }

    this.loading = true;
    this.loadError = null;
    return this.chatApi.openConversation({
      userId: u.id,
      peerId: this.peerId,
      peerKind: this.peerKind,
    }).pipe(
      switchMap((open) => {
        this.conversationId = open.conversationId;
        return this.chatApi.listMessages({
          userId: u.id,
          conversationId: open.conversationId,
          limit: 80,
        });
      }),
      tap((msgs) => {
        this.messages = msgs;
        this.loading = false;
      }),
      catchError((err: unknown) => {
        this.loadError = this.describeChatLoadError(err);
        this.loading = false;
        this.messages = [];
        this.conversationId = null;
        return of(undefined);
      }),
      map(() => undefined),
    );
  }

  private describeChatLoadError(err: unknown): string {
    const fallback =
      'Could not load chat. Check network and MongoDB configuration on the server.';
    if (!(err instanceof HttpErrorResponse)) {
      return fallback;
    }
    if (err.status === 0) {
      return 'No connection to the server. Check the internet and that the API is running.';
    }
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
      }
    }
    if (err.status >= 400 && err.status < 500) {
      return `Chat request failed (${err.status}). Check teacher/student link and URL parameters (kind=teacher for students).`;
    }
    return fallback;
  }

  toggleContacts(): void {
    this.chatUi.toggleContactsPanel();
  }

  clearPeer(): void {
    const base =
      this.auth.currentUser()?.role === 'TEACHER' ? '/teacher/chat' : '/student/chat';
    void this.router.navigate([base], { replaceUrl: true });
    this.peerId = null;
    this.peerKind = null;
    this.peerDisplayName = '';
    this.conversationId = null;
    this.messages = [];
    this.draft = '';
    this.loadError = null;
    this.sendError = null;
  }

  send(): void {
    const u = this.auth.currentUser();
    const text = this.draft.trim();
    this.sendError = null;
    if (!u?.id || !this.conversationId || !text) return;

    this.sending = true;
    this.chatApi.sendMessage(u.id, this.conversationId, text).subscribe({
      next: (m) => {
        this.messages = [...this.messages, m];
        this.draft = '';
        this.sending = false;
      },
      error: () => {
        this.sendError = 'Failed to send.';
        this.sending = false;
      },
    });
  }

  isMine(m: ChatMessage): boolean {
    const id = this.auth.currentUser()?.id;
    return !!id && m.senderUserId === id;
  }

  /** Підпис у шапці чату для вчителя: прізвище та ім’я (як у запиті). */
  protected teacherChatHeadingName(): string {
    const u = this.auth.currentUser();
    if (!u || u.role !== 'TEACHER') {
      return '';
    }
    const parts = [u.lastName, u.firstName].map((s) => s?.trim()).filter(Boolean);
    const fromParts = parts.join(' ').trim();
    if (fromParts) {
      return fromParts;
    }
    return (u.email?.trim() || 'Teacher');
  }
}
