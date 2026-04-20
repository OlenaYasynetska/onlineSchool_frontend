import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { ScheduleSlot } from '../../../features/school-admin/models/schedule-slot.model';

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

  @Output() readonly editSlot = new EventEmitter<ScheduleSlot>();
  @Output() readonly deleteSlot = new EventEmitter<ScheduleSlot>();

  readonly days = DAY_META;

  slotsForDay(d: number): ScheduleSlot[] {
    return this.slots
      .filter((s) => s.dayOfWeek === d)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
}
