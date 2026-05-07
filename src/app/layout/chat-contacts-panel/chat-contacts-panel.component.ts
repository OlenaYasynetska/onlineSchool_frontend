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
  styles: [
    `
      :host {
        position: absolute;
        left: 100%;
        top: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        width: min(20rem, calc(100vw - 4.5rem));
        max-width: 20rem;
        z-index: 40;
        transform: translateX(-100%);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition:
          transform 300ms ease-out,
          opacity 200ms ease-out,
          visibility 0s linear 300ms;
      }
      :host(.is-open) {
        transform: translateX(0);
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transition:
          transform 300ms ease-out,
          opacity 200ms ease-out,
          visibility 0s linear 0s;
      }
      @media (min-width: 768px) {
        :host {
          width: 20rem;
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
