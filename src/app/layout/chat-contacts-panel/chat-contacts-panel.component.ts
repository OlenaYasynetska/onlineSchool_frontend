import { Component, HostBinding, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  ChatUiService,
  type ChatPeerKind,
  type ChatRecentEntry,
} from '../../core/services/chat-ui.service';
import { StudentHomeworkService } from '../../features/student-dashboard/services/student-homework.service';
import { TeacherDashboardService } from '../../features/teacher-dashboard/services/teacher-dashboard.service';
import type { TeacherOptionShort } from '../../features/student-dashboard/models/student-homework.model';
import type { StudentRow } from '../../features/school-admin/models/school-admin-dashboard.model';

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

      .contacts-panel-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgb(203 213 225 / 0.9) rgb(248 250 252 / 0.8);
      }
      .contacts-panel-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .contacts-panel-scroll::-webkit-scrollbar-track {
        background: rgb(241 245 249 / 0.7);
        border-radius: 9999px;
        margin-block: 2px;
      }
      .contacts-panel-scroll::-webkit-scrollbar-thumb {
        background: rgb(203 213 225 / 0.95);
        border-radius: 9999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .contacts-panel-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgb(186 198 212 / 0.95);
      }
      :host-context(.dark) .contacts-panel-scroll {
        scrollbar-color: rgb(75 85 99 / 0.85) rgb(31 41 55 / 0.5);
      }
      :host-context(.dark) .contacts-panel-scroll::-webkit-scrollbar-track {
        background: rgb(31 41 55 / 0.45);
      }
      :host-context(.dark) .contacts-panel-scroll::-webkit-scrollbar-thumb {
        background: rgb(75 85 99 / 0.9);
      }
      :host-context(.dark) .contacts-panel-scroll::-webkit-scrollbar-thumb:hover {
        background-color: rgb(107 114 128 / 0.95);
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

  @HostBinding('class.is-open')
  get isOpen(): boolean {
    return this.chatUi.contactsPanelOpen();
  }

  searchQuery = '';
  loading = signal(false);
  loadError = signal<string | null>(null);

  teachers = signal<TeacherOptionShort[]>([]);
  students = signal<StudentRow[]>([]);

  private directoryLoadStarted = false;

  constructor() {
    effect(() => {
      if (!this.chatUi.contactsPanelOpen()) {
        return;
      }
      if (this.directoryLoadStarted) {
        return;
      }
      this.directoryLoadStarted = true;
      this.loadDirectory();
    });
  }

  private loadDirectory(): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    const role = u.role;
    this.loading.set(true);
    this.loadError.set(null);
    if (role === 'STUDENT') {
      this.studentHomework.listTeachers(u.id).subscribe({
        next: (list) => {
          this.teachers.set(list ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load teachers.');
          this.loading.set(false);
        },
      });
      return;
    }
    if (role === 'TEACHER') {
      this.teacherDash.listMyStudents(u.id).subscribe({
        next: (list) => {
          this.students.set(list ?? []);
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
    if (r === 'STUDENT') return kind === 'teacher';
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

  openChat(
    peerId: string,
    kind: ChatPeerKind,
    displayName: string,
    subtitle?: string,
  ): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.chatUi.touchRecent({ peerId, kind, displayName, subtitle });
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
}
