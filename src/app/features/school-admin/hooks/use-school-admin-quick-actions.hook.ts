import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type {
  SchoolAdminDashboardResponse,
  SchoolGroupCard,
} from '../models/school-admin-dashboard.model';
import type { AddGroupPayload } from '../components/add-group-modal/add-group-modal.component';
import type { AddStudentPayload } from '../components/add-student-modal/add-student-modal.component';
import type { AddTeacherPayload } from '../components/add-teacher-modal/add-teacher-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { SchoolAdminDashboardService } from '../services/school-admin-dashboard.service';
import {
  normalizeSchoolId,
  SESSION_STORAGE_SCHOOL_ID_KEY,
} from '../utils/school-id.util';
import { syncGroupCountsInDashboard } from '../utils/group-student-count.util';

function resolveSchoolIdForActions(
  auth: AuthService,
  dash: SchoolAdminDashboardResponse
): string {
  return (
    normalizeSchoolId(auth.currentUser()?.schoolId) ||
    normalizeSchoolId(dash.schoolId) ||
    (typeof sessionStorage !== 'undefined'
      ? normalizeSchoolId(sessionStorage.getItem(SESSION_STORAGE_SCHOOL_ID_KEY))
      : '')
  );
}

function httpErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as {
      error?: unknown;
      message?: string;
      status?: number;
    };
    if (typeof e.error === 'object' && e.error !== null && 'message' in e.error) {
      const m = (e.error as { message?: string }).message;
      if (typeof m === 'string' && m.trim()) {
        return m;
      }
    }
    if (typeof e.error === 'string' && e.error.trim()) {
      return e.error;
    }
    if (typeof e.message === 'string' && e.message.trim()) {
      return e.message;
    }
  }
  return 'Unknown error';
}

/** Після POST /students одразу показати рядок у таблиці, навіть якщо GET dashboard згодом впаде. */
function mergeCreatedStudentIntoDash(
  dash: SchoolAdminDashboardResponse,
  created: {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  }
): void {
  const joinedAt =
    typeof created.createdAt === 'string' && created.createdAt.length >= 10
      ? created.createdAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
  const rest = dash.students ?? [];
  const without = rest.filter((s) => s.id !== created.id);
  dash.students = [...without, {
    id: created.id,
    fullName: created.fullName,
    email: created.email,
    joinedAt,
    groupNames: [],
  }].sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
  dash.stats = {
    ...dash.stats,
    totalStudents: dash.students.length,
  };
}

/**
 * Логика кнопок "Add ..." в кабинете админа школы.
 * Здесь же — состояние модалок (пока только Add group реализован).
 */
export function useSchoolAdminQuickActions(
  dash: SchoolAdminDashboardResponse,
  onTeachersChanged?: () => void
) {
  const router = inject(Router);
  const auth = inject(AuthService);
  const dashApi = inject(SchoolAdminDashboardService);

  const addGroupOpen = signal(false);
  const addGroupSuccessOpen = signal(false);
  const lastCreatedGroupName = signal<string>('');

  const editGroupOpen = signal(false);
  const selectedEditGroup = signal<SchoolGroupCard | null>(null);

  const addTeacherOpen = signal(false);
  const addStudentOpen = signal(false);

  function addGroup(): void {
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
    addTeacherOpen.set(false);
    addStudentOpen.set(false);
    addGroupOpen.set(true);
  }

  function addTeacher(): void {
    addGroupOpen.set(false);
    addGroupSuccessOpen.set(false);
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
    addStudentOpen.set(false);
    addTeacherOpen.set(true);
  }

  function closeAddTeacherModal(): void {
    addTeacherOpen.set(false);
  }

  function onCreateTeacher(payload: AddTeacherPayload): void {
    const schoolId = resolveSchoolIdForActions(auth, dash);
    if (!schoolId) {
      window.alert(
        'School id is missing. Reload the page or log in again.'
      );
      console.error('No schoolId for current admin.');
      return;
    }

    dashApi.createTeacher(schoolId, payload).subscribe({
      next: (created) => {
        if (created.inviteEmailSent) {
          window.alert(
            'Invitation email has been sent to the teacher with login instructions.'
          );
        } else if (payload.sendInviteEmail) {
          window.alert(
            'Teacher account created. Email was not sent (configure SMTP on the server, or check logs).'
          );
        }
        addTeacherOpen.set(false);
        onTeachersChanged?.();
      },
      error: (err) => {
        console.error(err);
        const msg =
          err?.error?.message ||
          err?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Unknown error while creating teacher';
        window.alert(`Create teacher failed: ${msg}`);
      },
    });
  }

  function addEmployeer(): void {
    /* placeholder */
  }

  function addStudent(): void {
    addGroupOpen.set(false);
    addGroupSuccessOpen.set(false);
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
    addTeacherOpen.set(false);
    addStudentOpen.set(true);
  }

  function closeAddStudentModal(): void {
    addStudentOpen.set(false);
  }

  function onCreateStudent(payload: AddStudentPayload): void {
    const schoolId = resolveSchoolIdForActions(auth, dash);
    if (!schoolId) {
      window.alert(
        'Your account has no school linked (schoolId is missing). You cannot add students.'
      );
      console.error('No schoolId for current admin.');
      return;
    }

    const reloadDash = (): void => {
      dashApi.getDashboard(schoolId).subscribe({
        next: (data) => {
          Object.assign(dash, data);
          syncGroupCountsInDashboard(dash);
          addStudentOpen.set(false);
        },
        error: (err) => {
          console.error(err);
          window.alert(
            `Student was saved, but refreshing the dashboard failed: ${httpErrorMessage(err)}`
          );
          addStudentOpen.set(false);
        },
      });
    };

    dashApi.createStudent(schoolId, payload).subscribe({
      next: (created) => {
        mergeCreatedStudentIntoDash(dash, created);
        if (created.inviteEmailSent) {
          window.alert(
            'Invitation email has been sent to the student with login instructions.'
          );
        } else if (payload.sendInviteEmail) {
          window.alert(
            'Student account created. Email was not sent (configure SMTP on the server, or check logs).'
          );
        }
        const groupId = payload.groupId?.trim();
        if (groupId) {
          dashApi
            .enrollStudentInGroup(schoolId, groupId, created.id)
            .subscribe({
              next: () => reloadDash(),
              error: (err) => {
                console.error(err);
                window.alert(
                  `Student was created, but enrolling in group failed: ${httpErrorMessage(err)}`
                );
                reloadDash();
              },
            });
        } else {
          reloadDash();
        }
      },
      error: (err) => {
        console.error(err);
        window.alert(`Create student failed: ${httpErrorMessage(err)}`);
      },
    });
  }

  function closeAddGroupModal(): void {
    addGroupOpen.set(false);
  }

  function closeSuccessModal(): void {
    addGroupSuccessOpen.set(false);
  }

  function onCreateGroup(payload: AddGroupPayload): void {
    const schoolId = resolveSchoolIdForActions(auth, dash);
    if (!schoolId) {
      window.alert(
        'School id is missing. Reload the page or log in again.'
      );
      console.error('No schoolId for current admin.');
      return;
    }

    dashApi.createGroup(schoolId, payload).subscribe({
      next: (created: SchoolGroupCard) => {
        const list = dash.groups ?? [];
        const idx = list.findIndex((g) => g.id === created.id);
        if (idx >= 0) {
          list[idx] = created;
        } else {
          list.push(created);
        }
        dash.groups = [...list];
        lastCreatedGroupName.set(created.name);
        addGroupOpen.set(false);
        addGroupSuccessOpen.set(true);
      },
      error: (err) => {
        console.error(err);
        const msg =
          err?.error?.message ||
          err?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Unknown error while creating group';
        const details =
          err?.error && typeof err.error === 'object'
            ? `\n\nDetails:\n${JSON.stringify(err.error, null, 2)}`
            : '';
        window.alert(`Create group failed: ${msg}${details}`);
        // оставляем модалку открытой, чтобы пользователь мог исправить форму
      },
    });
  }

  function openEditGroup(group: SchoolGroupCard): void {
    addGroupOpen.set(false);
    addGroupSuccessOpen.set(false);
    addStudentOpen.set(false);
    addTeacherOpen.set(false);
    selectedEditGroup.set(group);
    editGroupOpen.set(true);
  }

  function closeEditGroupModal(): void {
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
  }

  function onEditGroupApply(payload: AddGroupPayload): void {
    // Той самий POST, але payload містить groupId — бекенд оновлює рядок за id, а не upsert лише за code.
    const schoolId = resolveSchoolIdForActions(auth, dash);
    if (!schoolId) {
      window.alert(
        'School id is missing. Reload the page or log in again.'
      );
      console.error('No schoolId for current admin.');
      return;
    }

    dashApi.createGroup(schoolId, payload).subscribe({
      next: (created: SchoolGroupCard) => {
        const list = dash.groups ?? [];
        const idx = list.findIndex((g) => g.id === created.id);
        if (idx >= 0) {
          list[idx] = created;
        } else {
          list.push(created);
        }
        dash.groups = [...list];
        syncGroupCountsInDashboard(dash);
        closeEditGroupModal();
      },
      error: (err) => {
        console.error(err);
        const msg =
          err?.error?.message ||
          err?.message ||
          (typeof err?.error === 'string' ? err.error : null) ||
          'Unknown error while editing group';
        const details =
          err?.error && typeof err.error === 'object'
            ? `\n\nDetails:\n${JSON.stringify(err.error, null, 2)}`
            : '';
        window.alert(`Edit group failed: ${msg}${details}`);
      },
    });
  }

  function addAnotherGroup(): void {
    addGroupSuccessOpen.set(false);
    // Открываем create после закрытия success (через microtask, чтобы не было "мигания")
    queueMicrotask(() => addGroupOpen.set(true));
  }

  function backToHomeFromSuccess(): void {
    addGroupSuccessOpen.set(false);
    void router.navigate(['/school-admin']);
  }

  return {
    addGroup,
    addTeacher,
    addEmployeer,
    addStudent,

    addTeacherOpen,
    closeAddTeacherModal,
    onCreateTeacher,

    addStudentOpen,
    closeAddStudentModal,
    onCreateStudent,

    addGroupOpen,
    addGroupSuccessOpen,
    lastCreatedGroupName,

    closeAddGroupModal,
    closeSuccessModal,
    onCreateGroup,

    addAnotherGroup,
    backToHomeFromSuccess,

    // Edit group
    editGroupOpen,
    selectedEditGroup,
    openEditGroup,
    closeEditGroupModal,
    onEditGroupApply,
  };
}

