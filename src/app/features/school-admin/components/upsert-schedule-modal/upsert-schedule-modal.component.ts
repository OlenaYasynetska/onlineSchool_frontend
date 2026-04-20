import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ScheduleSlot, UpsertSchedulePayload } from '../../models/schedule-slot.model';
import type {
  SchoolGroupCard,
  SchoolSubject,
  SchoolTeacher,
} from '../../models/school-admin-dashboard.model';

export type { UpsertSchedulePayload };

const DAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

@Component({
  selector: 'app-upsert-schedule-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upsert-schedule-modal.component.html',
})
export class UpsertScheduleModalComponent implements OnChanges {
  @Input({ required: true }) open = false;
  @Input() schoolId = '';
  @Input() groups: SchoolGroupCard[] = [];
  @Input() teachers: SchoolTeacher[] = [];
  @Input() subjects: SchoolSubject[] = [];
  /** Якщо задано — режим редагування. */
  @Input() editSlot: ScheduleSlot | null = null;
  /** Для створення: попередньо обрати клас/групу (якщо id є в `groups`). */
  @Input() defaultGroupId: string | null = null;

  @Output() readonly closeRequested = new EventEmitter<void>();
  @Output() readonly submitted = new EventEmitter<UpsertSchedulePayload>();

  readonly dayOptions = DAYS;

  form = {
    groupId: '',
    teacherId: '',
    subjectId: '' as string,
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    validFrom: '',
    validUntil: '',
    notes: '',
    room: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.open) return;

    if (this.editSlot) {
      if (changes['open']?.currentValue || changes['editSlot']) {
        const s = this.editSlot;
        this.form = {
          groupId: s.groupId,
          teacherId: s.teacherId,
          subjectId: s.subjectId ?? '',
          dayOfWeek: s.dayOfWeek,
          startTime: this.normalizeTimeForInput(s.startTime),
          endTime: this.normalizeTimeForInput(s.endTime),
          validFrom: s.validFrom ?? '',
          validUntil: s.validUntil ?? '',
          notes: s.notes ?? '',
          room: s.room ?? '',
        };
      }
    } else if (
      changes['open']?.currentValue ||
      changes['groups'] ||
      changes['teachers'] ||
      changes['subjects'] ||
      changes['defaultGroupId']
    ) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form = {
      groupId: this.resolveDefaultGroupId(),
      teacherId: this.teachers[0]?.id ?? '',
      subjectId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      validFrom: '',
      validUntil: '',
      notes: '',
      room: '',
    };
  }

  private resolveDefaultGroupId(): string {
    const want = this.defaultGroupId?.trim();
    if (want && this.groups.some((g) => g.id === want)) return want;
    return this.groups[0]?.id ?? '';
  }

  /**
   * Предмети з каталогу школи, які призначені обраному викладачу (`subjectTitles` з API).
   * У режимі редагування поточний предмет слота додається, якщо його немає в списку (рідкісна неконсистентність даних).
   */
  subjectsForSelectedTeacher(): SchoolSubject[] {
    const tid = this.form.teacherId?.trim();
    const teacher = tid ? this.teachers.find((t) => t.id === tid) : undefined;
    if (!teacher) return [];
    return this.buildSubjectsForTeacher(teacher);
  }

  onTeacherChange(teacherId: string): void {
    const teacher = this.teachers.find((t) => t.id === teacherId);
    if (!teacher) return;
    const allowed = this.buildSubjectsForTeacher(teacher);
    const sid = this.form.subjectId?.trim();
    if (sid && !allowed.some((s) => s.id === sid)) {
      this.form.subjectId = '';
    }
  }

  private buildSubjectsForTeacher(teacher: SchoolTeacher): SchoolSubject[] {
    const titles = new Set(
      teacher.subjectTitles.map((x) => x.trim().toLowerCase()).filter((x) => x.length > 0)
    );
    let list =
      titles.size === 0
        ? []
        : this.subjects.filter((s) => titles.has(s.title.trim().toLowerCase()));
    const editId = this.editSlot?.subjectId?.trim();
    if (editId) {
      const cur = this.subjects.find((s) => s.id === editId);
      if (cur && !list.some((s) => s.id === cur.id)) {
        list = [...list, cur];
      }
    }
    return [...list].sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    );
  }

  /** Бекенд може повертати `9:00:00` — для input type=time потрібно `HH:mm`. */
  private normalizeTimeForInput(t: string): string {
    const s = t.trim();
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '09:00';
    const h = m[1].padStart(2, '0');
    const min = m[2];
    return `${h}:${min}`;
  }

  submit(): void {
    const subjectTrim = this.form.subjectId?.trim();
    this.submitted.emit({
      groupId: this.form.groupId.trim(),
      teacherId: this.form.teacherId.trim(),
      subjectId: subjectTrim ? subjectTrim : null,
      dayOfWeek: this.form.dayOfWeek,
      startTime: this.form.startTime,
      endTime: this.form.endTime,
      validFrom: this.form.validFrom?.trim() || null,
      validUntil: this.form.validUntil?.trim() || null,
      notes: this.form.notes?.trim() || null,
      room: this.form.room?.trim() || null,
    });
  }
}
