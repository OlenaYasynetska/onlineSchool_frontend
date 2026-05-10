import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  SchoolChatApiService,
  type ChatConversationSummary,
} from '../../features/chat/school-chat-api.service';

/** Роль співрозмовника в чаті (не поточного користувача). */
export type ChatPeerKind = 'teacher' | 'student';

export interface ChatRecentEntry {
  peerId: string;
  kind: ChatPeerKind;
  displayName: string;
  subtitle?: string;
  lastTouchedIso: string;
}

const STORAGE_KEY = 'owlChatRecent.v1';
const MAX_RECENT = 30;

function safeParse(raw: string | null): ChatRecentEntry[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (e) =>
          e &&
          typeof e === 'object' &&
          typeof (e as ChatRecentEntry).peerId === 'string' &&
          typeof (e as ChatRecentEntry).displayName === 'string',
      )
      .map((e) => e as ChatRecentEntry);
  } catch {
    return [];
  }
}

function normalizePath(url: string): string {
  return url.split('?')[0].replace(/\/$/, '') || '/';
}

function isChatRoutePath(path: string): boolean {
  return (
    path === '/student/chat' ||
    path.startsWith('/student/chat/') ||
    path === '/teacher/chat' ||
    path.startsWith('/teacher/chat/')
  );
}

@Injectable({ providedIn: 'root' })
export class ChatUiService {
  readonly contactsPanelOpen = signal(false);
  /** Сума непрочитаних по всіх діалогах (для значка в сайдбарі). */
  readonly chatUnreadTotal = signal(0);
  /** Ключ `kind:peerEntityId` → кількість непрочитаних (для крапки біля імені в панелі). */
  readonly unreadByPeer = signal<Record<string, number>>({});

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly chatApi = inject(SchoolChatApiService);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        if (!isChatRoutePath(normalizePath(this.router.url))) {
          this.closeContactsPanel();
        }
      });
  }

  openContactsPanel(): void {
    this.contactsPanelOpen.set(true);
  }

  closeContactsPanel(): void {
    this.contactsPanelOpen.set(false);
  }

  toggleContactsPanel(): void {
    this.contactsPanelOpen.update((v) => !v);
  }

  readRecent(): ChatRecentEntry[] {
    if (typeof localStorage === 'undefined') return [];
    return safeParse(localStorage.getItem(STORAGE_KEY)).sort((a, b) =>
      b.lastTouchedIso.localeCompare(a.lastTouchedIso),
    );
  }

  touchRecent(entry: {
    peerId: string;
    kind: ChatPeerKind;
    displayName: string;
    subtitle?: string;
  }): void {
    if (typeof localStorage === 'undefined') return;
    const now = new Date().toISOString();
    const list = safeParse(localStorage.getItem(STORAGE_KEY));
    const without = list.filter((e) => e.peerId !== entry.peerId);
    const next: ChatRecentEntry[] = [
      {
        ...entry,
        lastTouchedIso: now,
      },
      ...without,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  /**
   * Оновити непрочитані по діалогах з відповіді API (панель контактів або після mark read).
   */
  syncUnreadFromSummaries(summaries: ChatConversationSummary[]): void {
    const map: Record<string, number> = {};
    let sum = 0;
    for (const s of summaries ?? []) {
      if (s.peerKind !== 'teacher' && s.peerKind !== 'student') continue;
      const k = `${s.peerKind}:${s.peerEntityId}`;
      const n = Number(s.unreadCount) || 0;
      map[k] = n;
      sum += n;
    }
    this.unreadByPeer.set(map);
    this.chatUnreadTotal.set(Math.max(0, sum));
  }

  /** Оновити лічильник непрочитаних (після відкриття чату або з панелі контактів). */
  refreshUnreadTotals(): void {
    const u = this.auth.currentUser();
    if (!u?.id || (u.role !== 'STUDENT' && u.role !== 'TEACHER')) {
      this.chatUnreadTotal.set(0);
      this.unreadByPeer.set({});
      return;
    }
    this.chatApi
      .listConversations(u.id)
      .pipe(catchError(() => of([] as ChatConversationSummary[])))
      .subscribe((list) => this.syncUnreadFromSummaries(list ?? []));
  }
}
