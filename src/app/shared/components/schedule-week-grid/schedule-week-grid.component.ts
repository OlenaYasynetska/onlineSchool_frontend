import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ScheduleSlot } from '../../../features/school-admin/models/schedule-slot.model';
import {
  calendarDayInSchoolWeek,
  formatShortDayDate,
} from '../../utils/schedule-week-dates';

const DAY_META: { value: number; short: string }[] = [
  { value: 1, short: 'Mon' },
  { value: 2, short: 'Tue' },
  { value: 3, short: 'Wed' },
  { value: 4, short: 'Thu' },
  { value: 5, short: 'Fri' },
  { value: 6, short: 'Sat' },
  { value: 7, short: 'Sun' },
];

@Component({
  selector: 'app-schedule-week-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-week-grid.component.html',
})
export class ScheduleWeekGridComponent {
  @Input() slots: ScheduleSlot[] = [];
  @Input() readOnly = true;
  /** When true, hides the class/group line (e.g. per-group schedule view). */
  @Input() hideGroupName = false;
  /**
   * Monday of the displayed week (`yyyy-MM-dd`). When set, column headers show that week's dates.
   * Teacher/student views omit this.
   */
  @Input() weekStartMonday: string | null = null;
  /** When the admin modal flags conflicting slots, those cards get a distinct style. */
  @Input() highlightedSlotIds: ReadonlySet<string> | null = null;

  @Output() readonly editSlot = new EventEmitter<ScheduleSlot>();
  @Output() readonly deleteSlot = new EventEmitter<ScheduleSlot>();

  readonly days = DAY_META;

  headerDateLabel(dayOfWeek: number): string {
    if (!this.weekStartMonday?.trim()) return '';
    const iso = calendarDayInSchoolWeek(this.weekStartMonday.trim(), dayOfWeek);
    return formatShortDayDate(iso);
  }

  slotsForDay(d: number): ScheduleSlot[] {
    return this.slots
      .filter((s) => s.dayOfWeek === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  slotIsConflictHighlighted(slot: ScheduleSlot): boolean {
    return !!this.highlightedSlotIds?.has(slot.id);
  }
}
