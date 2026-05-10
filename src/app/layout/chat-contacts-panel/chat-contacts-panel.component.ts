import { Component, HostBinding, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import {
  ChatUiService,
  type ChatPeerKind,
  type ChatRecentEntry,
} from '../../core/services/chat-ui.service';
import { StudentHomeworkService } from '../../features/student-dashboard/services/student-homework.service';
import { TeacherDashboardService } from '../../features/teacher-dashboard/services/teacher-dashboard.service';
import type {
  ClassmateOptionShort,
  TeacherOptionShort,
} from '../../features/student-dashboard/models/student-homework.model';
import type { StudentRow } from '../../features/school-admin/models/school-admin-dashboard.model';
import { useChatContactsPanelLayout } from '../../shared/hooks/use-chat-contacts-panel-layout.hook';
import {
  SchoolChatApiService,
  type ChatConversationSummary,
} from '../../features/chat/school-chat-api.service';

@Component({
  selector: 'app-chat-contacts-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-contacts-panel.component.html',
  host: {
    class:
      'border-r border-slate-200/90 bg-slate-50/90 dark:border-gray-700 dark:bg-gray-900',
  },
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        min-height: 0;
        height: 100%;
        width: min(20rem, calc(100vw - 4.25rem - 12px));
        max-width: 0;
        min-width: 0;
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
          max-width 300ms ease-out,
          opacity 200ms ease-out,
          visibility 0s linear 300ms;
      }
      @media (min-width: 768px) {
        :host {
          width: 20rem;
        }
      }
      :host(.is-open) {
        max-width: min(20rem, calc(100vw - 4.25rem - 12px));
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition:
          max-width 300ms ease-out,
          opacity 200ms ease-out,
          visibility 0s linear 0s;
      }
      @media (min-width: 768px) {
        :host(.is-open) {
          max-width: 20rem;
        }
      }
    `,
  ],
})
export class ChatContactsPanelComponent {
  protected readonly chatUi = inject(ChatUiService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly studentHomework = inject(StudentHomeworkService);
  private readonly teacherDash = inject(TeacherDashboardService);
  private readonly chatApi = inject(SchoolChatApiService);

  protected readonly contactsLayout = useChatContactsPanelLayout();

  @HostBinding('class.is-open')
  get isOpen(): boolean {
    return this.chatUi.contactsPanelOpen();
  }

  searchQuery = '';
  loading = signal(false);
  loadError = signal<string | null>(null);

  teachers = signal<TeacherOptionShort[]>([]);
  classmates = signal<ClassmateOptionShort[]>([]);
  students = signal<StudentRow[]>([]);
  /** Ключ `kind:peerId` → кількість непрочитаних від співрозмовника. */
  protected readonly unreadByPeer = signal<Record<string, number>>({});

  private directoryLoadStarted = false;

  constructor() {
    effect(() => {
      if (!this.chatUi.contactsPanelOpen()) {
        return;
      }
      if (!this.directoryLoadStarted) {
        this.directoryLoadStarted = true;
        this.loadDirectory();
        return;
      }
      this.refreshUnreadOnly();
    });
  }

  private refreshUnreadOnly(): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    if (u.role !== 'STUDENT' && u.role !== 'TEACHER') return;
    this.chatApi
      .listConversations(u.id)
      .pipe(catchError(() => of([] as ChatConversationSummary[])))
      .subscribe((summaries) => this.applyUnreadFromSummaries(summaries ?? []));
  }

  private loadDirectory(): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    const role = u.role;
    this.loading.set(true);
    this.loadError.set(null);
    if (role === 'STUDENT') {
      forkJoin({
        teachers: this.studentHomework.listTeachers(u.id),
        classmates: this.studentHomework.listClassmates(u.id),
        summaries: this.chatApi.listConversations(u.id).pipe(catchError(() => of([] as ChatConversationSummary[]))),
      }).subscribe({
        next: ({ teachers, classmates, summaries }) => {
          this.teachers.set(teachers ?? []);
          this.classmates.set(classmates ?? []);
          this.applyUnreadFromSummaries(summaries ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load contacts.');
          this.loading.set(false);
        },
      });
      return;
    }
    if (role === 'TEACHER') {
      forkJoin({
        students: this.teacherDash.listMyStudents(u.id),
        summaries: this.chatApi.listConversations(u.id).pipe(catchError(() => of([] as ChatConversationSummary[]))),
      }).subscribe({
        next: ({ students, summaries }) => {
          this.students.set(students ?? []);
          this.applyUnreadFromSummaries(summaries ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load students.');
          this.loading.set(false);
        },
      });
      return;
    }
    this.loading.set(false);
  }

  recent(): ChatRecentEntry[] {
    return this.chatUi.readRecent().filter((e) => this.matchesRoleFilter(e.kind));
  }

  private matchesRoleFilter(kind: ChatPeerKind): boolean {
    const r = this.auth.currentUser()?.role;
    if (r === 'STUDENT') return kind === 'teacher' || kind === 'student';
    if (r === 'TEACHER') return kind === 'student';
    return false;
  }

  filteredDirectory(): {
    id: string;
    name: string;
    subtitle: string;
    kind: ChatPeerKind;
  }[] {
    const q = this.searchQuery.trim().toLowerCase();
    const role = this.auth.currentUser()?.role;
    if (role === 'STUDENT') {
      return (this.teachers() ?? [])
        .filter((t) => {
          if (!q) return true;
          return t.displayName.toLowerCase().includes(q);
        })
        .map((t) => ({
          id: t.id,
          name: t.displayName,
          subtitle: 'Teacher',
          kind: 'teacher' as const,
        }));
    }
    if (role === 'TEACHER') {
      return (this.students() ?? [])
        .filter((s) => {
          if (!q) return true;
          const hay = `${s.fullName} ${s.email} ${(s.groupNames ?? []).join(' ')}`.toLowerCase();
          return hay.includes(q);
        })
        .map((s) => ({
          id: s.id,
          name: s.fullName,
          subtitle: s.email,
          kind: 'student' as const,
        }));
    }
    return [];
  }

  filteredClassmates(): {
    id: string;
    name: string;
    subtitle: string;
    kind: ChatPeerKind;
  }[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (this.auth.currentUser()?.role !== 'STUDENT') return [];
    return (this.classmates() ?? [])
      .filter((c) => {
        if (!q) return true;
        return c.displayName.toLowerCase().includes(q);
      })
      .map((c) => ({
        id: c.id,
        name: c.displayName,
        subtitle: 'Classmate',
        kind: 'student' as const,
      }));
  }

  /** Аватар учня біля контакту: для вчителя (діалог із учнем) і для учня (однокласник). */
  protected showPeerStudentAvatar(kind: ChatPeerKind): boolean {
    const r = this.auth.currentUser()?.role;
    if (r === 'TEACHER' && kind === 'student') return true;
    return r === 'STUDENT' && kind === 'student';
  }

  openChat(
    peerId: string,
    kind: ChatPeerKind,
    displayName: string,
    subtitle?: string,
  ): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.chatUi.touchRecent({
      peerId,
      kind,
      displayName,
      subtitle: u.role === 'TEACHER' ? undefined : subtitle,
    });
    const base = u.role === 'TEACHER' ? '/teacher/chat' : '/student/chat';
    void this.router.navigate([base], {
      queryParams: { peer: peerId, kind, name: displayName },
    });
    this.chatUi.closeContactsPanel();
  }

  openFromRecent(e: ChatRecentEntry): void {
    this.openChat(e.peerId, e.kind, e.displayName, e.subtitle);
  }

  closePanel(): void {
    this.chatUi.closeContactsPanel();
  }

  directoryHeading(): string {
    const r = this.auth.currentUser()?.role;
    if (r === 'STUDENT') return 'Teachers at your school';
    if (r === 'TEACHER') return 'Students in your groups';
    return 'Contacts';
  }

  protected peerUnreadKey(peerId: string, kind: ChatPeerKind): string {
    return `${kind}:${peerId}`;
  }

  unreadCountForPeer(peerId: string, kind: ChatPeerKind): number {
    const n = this.unreadByPeer()[this.peerUnreadKey(peerId, kind)];
    return typeof n === 'number' && n > 0 ? n : 0;
  }

  private applyUnreadFromSummaries(summaries: ChatConversationSummary[]): void {
    const map: Record<string, number> = {};
    let sum = 0;
    for (const s of summaries) {
      if (s.peerKind !== 'teacher' && s.peerKind !== 'student') continue;
      const k = this.peerUnreadKey(s.peerEntityId, s.peerKind);
      const n = Number(s.unreadCount) || 0;
      map[k] = n;
      sum += n;
    }
    this.unreadByPeer.set(map);
    this.chatUi.setUnreadTotalAggregated(sum);
  }
}
