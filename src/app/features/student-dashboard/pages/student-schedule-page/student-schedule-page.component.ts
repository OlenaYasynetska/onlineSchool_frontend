import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ScheduleReadService } from '../../../school-admin/services/schedule-read.service';
import type { ScheduleSlot } from '../../../school-admin/models/schedule-slot.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ScheduleWeekGridComponent } from '../../../../shared/components/schedule-week-grid/schedule-week-grid.component';
import {
  addWeeksIso,
  calendarDayInSchoolWeek,
  formatWeekRange,
  isoDateMondayOfWeek,
  slotVisibleOnCalendarDay,
} from '../../../../shared/utils/schedule-week-dates';

@Component({
  selector: 'app-student-schedule-page',
  standalone: true,
  imports: [CommonModule, ScheduleWeekGridComponent],
  templateUrl: './student-schedule-page.component.html',
})
export class StudentSchedulePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly scheduleRead = inject(ScheduleReadService);

  loading = true;
  noProfile = false;
  error: string | null = null;
  slots = signal<ScheduleSlot[]>([]);
  /** Monday (`yyyy-MM-dd`) of the week shown in the grid. */
  weekStartStudent = signal<string>(isoDateMondayOfWeek(new Date()));

  get displayName(): string {
    const u = this.auth.currentUser();
    if (!u) return 'Student';
    const full = `${u.firstName} ${u.lastName}`.trim();
    return full || 'Student';
  }

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      return;
    }
    this.scheduleRead.studentSchedule(u.id).subscribe({
      next: (list) => {
        this.slots.set(list);
        this.loading = false;
        this.noProfile = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.noProfile = true;
        } else {
          this.error = err.error?.message ?? err.message ?? 'Failed to load schedule';
        }
      },
    });
  }

  weekMondayFor(): string {
    return this.weekStartStudent() || isoDateMondayOfWeek(new Date());
  }

  weekRangeLabel(): string {
    return formatWeekRange(this.weekMondayFor());
  }

  shiftWeek(deltaWeeks: number): void {
    const cur = this.weekMondayFor();
    this.weekStartStudent.set(addWeeksIso(cur, deltaWeeks));
  }

  /** Lessons visible for the selected calendar week (validity range). */
  slotsForWeek(): ScheduleSlot[] {
    const weekIso = this.weekMondayFor();
    return this.slots()
      .filter((s) => {
        const dayIso = calendarDayInSchoolWeek(weekIso, s.dayOfWeek);
        return slotVisibleOnCalendarDay(s.validFrom, s.validUntil, dayIso);
      });
  }
}
