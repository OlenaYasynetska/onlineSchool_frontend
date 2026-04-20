import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import type { ScheduleSlot, UpsertSchedulePayload } from '../../models/schedule-slot.model';
import type {
  SchoolGroupCard,
  SchoolSubject,
  SchoolTeacher,
} from '../../models/school-admin-dashboard.model';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';
import { SchoolScheduleService } from '../../services/school-schedule.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  normalizeSchoolId,
  SESSION_STORAGE_SCHOOL_ID_KEY,
} from '../../utils/school-id.util';
import { UpsertScheduleModalComponent } from '../../components/upsert-schedule-modal/upsert-schedule-modal.component';
import { ScheduleWeekGridComponent } from '../../../../shared/components/schedule-week-grid/schedule-week-grid.component';
import {
  addWeeksIso,
  calendarDayInSchoolWeek,
  formatWeekRange,
  isoDateMondayOfWeek,
  slotVisibleOnCalendarDay,
} from '../../../../shared/utils/schedule-week-dates';

@Component({
  selector: 'app-school-schedule-page',
  standalone: true,
  imports: [
    CommonModule,
    UpsertScheduleModalComponent,
    ScheduleWeekGridComponent,
  ],
  templateUrl: './school-schedule-page.component.html',
})
export class SchoolSchedulePageComponent implements OnInit {
  private readonly dashApi = inject(SchoolAdminDashboardService);
  private readonly scheduleApi = inject(SchoolScheduleService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = true;
  noSchoolAssigned = false;
  schoolId = '';

  groups: SchoolGroupCard[] = [];
  teachers: SchoolTeacher[] = [];
  subjects: SchoolSubject[] = [];
  slots = signal<ScheduleSlot[]>([]);

  modalOpen = signal(false);
  editingSlot = signal<ScheduleSlot | null>(null);
  /** Preset group when opening "Add lesson" from a class section. */
  defaultGroupForModal = signal<string | null>(null);
  /** Monday (`yyyy-MM-dd`) of the week shown per class; independent navigation. */
  weekStartMondayByGroup = signal<Record<string, string>>({});

  get adminDisplayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Admin';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Admin';
  }

  ngOnInit(): void {
    const fromAuth = normalizeSchoolId(this.auth.currentUser()?.schoolId);
    const fromSession =
      typeof sessionStorage !== 'undefined'
        ? normalizeSchoolId(
            sessionStorage.getItem(SESSION_STORAGE_SCHOOL_ID_KEY)
          )
        : '';
    const resolved = fromAuth || fromSession;
    if (!resolved) {
      this.noSchoolAssigned = true;
      this.loading = false;
      return;
    }
    this.schoolId = resolved;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_SCHOOL_ID_KEY, resolved);
    }
    this.loadAll(resolved);
  }

  private loadAll(schoolId: string): void {
    this.loading = true;
    forkJoin({
      dash: this.dashApi.getDashboard(schoolId),
      teachers: this.dashApi.listTeachers(schoolId),
      subjects: this.dashApi.listSubjects(schoolId),
      schedule: this.scheduleApi.list(schoolId),
    }).subscribe({
      next: ({ dash, teachers, subjects, schedule }) => {
        this.groups = dash.groups ?? [];
        this.teachers = teachers;
        this.subjects = subjects;
        this.slots.set(schedule);
        const mon = isoDateMondayOfWeek(new Date());
        const weekAnchors: Record<string, string> = {};
        for (const g of this.groups) {
          weekAnchors[g.id] = mon;
        }
        this.weekStartMondayByGroup.set(weekAnchors);
        const echoed = normalizeSchoolId(dash.schoolId);
        if (echoed) {
          this.schoolId = echoed;
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_STORAGE_SCHOOL_ID_KEY, echoed);
          }
        }
        this.loading = false;
        if (this.route.snapshot.queryParamMap.get('new') === '1') {
          this.openCreate();
          void this.router.navigate(['/school-admin/schedule'], {
            replaceUrl: true,
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  openCreate(groupId?: string | null): void {
    this.editingSlot.set(null);
    const g = groupId?.trim();
    this.defaultGroupForModal.set(g || null);
    this.modalOpen.set(true);
  }

  openEdit(slot: ScheduleSlot): void {
    this.editingSlot.set(slot);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingSlot.set(null);
    this.defaultGroupForModal.set(null);
  }

  sortedGroups(): SchoolGroupCard[] {
    return [...this.groups].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }

  weekMondayFor(groupId: string): string {
    return (
      this.weekStartMondayByGroup()[groupId] ?? isoDateMondayOfWeek(new Date())
    );
  }

  weekRangeLabel(groupId: string): string {
    return formatWeekRange(this.weekMondayFor(groupId));
  }

  shiftWeek(groupId: string, deltaWeeks: number): void {
    const cur = this.weekMondayFor(groupId);
    const next = addWeeksIso(cur, deltaWeeks);
    this.weekStartMondayByGroup.update((m) => ({ ...m, [groupId]: next }));
  }

  /** Slots for this class that apply to at least one day in the selected calendar week. */
  slotsForGroupAndWeek(groupId: string, weekMondayIso: string): ScheduleSlot[] {
    return this.slots()
      .filter((s) => s.groupId === groupId)
      .filter((s) => {
        const dayIso = calendarDayInSchoolWeek(weekMondayIso, s.dayOfWeek);
        return slotVisibleOnCalendarDay(s.validFrom, s.validUntil, dayIso);
      });
  }

  onSubmit(payload: UpsertSchedulePayload): void {
    const sid = this.schoolId;
    if (!sid) return;
    const edit = this.editingSlot();
    if (edit) {
      this.scheduleApi.update(sid, edit.id, payload).subscribe({
        next: (updated) => {
          this.slots.update((list) =>
            list.map((s) => (s.id === updated.id ? updated : s))
          );
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          window.alert(this.errMsg(err, 'Update failed'));
        },
      });
    } else {
      this.scheduleApi.create(sid, payload).subscribe({
        next: (created) => {
          this.slots.update((list) => [...list, created]);
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
          window.alert(this.errMsg(err, 'Create failed'));
        },
      });
    }
  }

  onDelete(slot: ScheduleSlot): void {
    const sid = this.schoolId;
    if (!sid) return;
    if (!window.confirm(`Delete this lesson slot (${slot.groupName})?`)) {
      return;
    }
    this.scheduleApi.delete(sid, slot.id).subscribe({
      next: () => {
        this.slots.update((list) => list.filter((s) => s.id !== slot.id));
      },
      error: (err) => {
        console.error(err);
        window.alert(this.errMsg(err, 'Delete failed'));
      },
    });
  }

  private errMsg(err: unknown, fallback: string): string {
    if (err && typeof err === 'object') {
      const e = err as { error?: { message?: string } | string; message?: string };
      if (typeof e.error === 'object' && e.error?.message) return e.error.message;
      if (typeof e.error === 'string' && e.error.trim()) return e.error;
      if (typeof e.message === 'string' && e.message.trim()) return e.message;
    }
    return fallback;
  }
}
