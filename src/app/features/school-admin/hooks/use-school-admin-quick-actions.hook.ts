import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { SchoolAdminDashboardResponse, SchoolGroupCard } from '../models/school-admin-dashboard.model';
import type { AddGroupPayload } from '../components/add-group-modal/add-group-modal.component';
import type { AddTeacherPayload } from '../components/add-teacher-modal/add-teacher-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { SchoolAdminDashboardService } from '../services/school-admin-dashboard.service';

/**
 * Логика кнопок "Add ..." в кабинете админа школы.
 * Здесь же — состояние модалок (пока только Add group реализован).
 */
export function useSchoolAdminQuickActions(dash: SchoolAdminDashboardResponse) {
  const router = inject(Router);
  const auth = inject(AuthService);
  const dashApi = inject(SchoolAdminDashboardService);

  const addGroupOpen = signal(false);
  const addGroupSuccessOpen = signal(false);
  const lastCreatedGroupName = signal<string>('');

  const editGroupOpen = signal(false);
  const selectedEditGroup = signal<SchoolGroupCard | null>(null);

  const addTeacherOpen = signal(false);

  function addGroup(): void {
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
    addTeacherOpen.set(false);
    addGroupOpen.set(true);
  }

  function addTeacher(): void {
    addGroupOpen.set(false);
    addGroupSuccessOpen.set(false);
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
    addTeacherOpen.set(true);
  }

  function closeAddTeacherModal(): void {
    addTeacherOpen.set(false);
  }

  function onCreateTeacher(payload: AddTeacherPayload): void {
    const schoolId = auth.currentUser()?.schoolId;
    if (!schoolId) {
      console.error('No schoolId for current admin.');
      return;
    }

    dashApi.createTeacher(schoolId, payload).subscribe({
      next: () => {
        addTeacherOpen.set(false);
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
    /* placeholder */
  }

  function closeAddGroupModal(): void {
    addGroupOpen.set(false);
  }

  function closeSuccessModal(): void {
    addGroupSuccessOpen.set(false);
  }

  function onCreateGroup(payload: AddGroupPayload): void {
    const schoolId = auth.currentUser()?.schoolId;
    if (!schoolId) {
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
    selectedEditGroup.set(group);
    editGroupOpen.set(true);
  }

  function closeEditGroupModal(): void {
    editGroupOpen.set(false);
    selectedEditGroup.set(null);
  }

  function onEditGroupApply(payload: AddGroupPayload): void {
    // Используем тот же endpoint, что и для Create: backend делает upsert.
    const schoolId = auth.currentUser()?.schoolId;
    if (!schoolId) {
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

