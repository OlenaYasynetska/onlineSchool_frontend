import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SchoolSubject, SchoolTeacher } from '../../models/school-admin-dashboard.model';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';

export type AddGroupPayload = {
  name: string;
  code: string;
  /** Предмет з таблиці `school_subjects` (якщо обрано у випадаючому списку). */
  subjectId?: string | null;
  /** Викладач з таблиці `teachers` (опційно). */
  teacherId?: string | null;
  /** Якщо `subjectId` не передано — текст з БД (legacy). */
  topicsLabel: string;
  startDate: string; // dd.MM.yyyy
  endDate: string; // dd.MM.yyyy
  studentsCount: number;
  active: boolean;
};

@Component({
  selector: 'app-add-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden bg-slate-900/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-group-title"
      (click)="$event.stopPropagation()"
    >
      <div class="relative z-10 w-full max-w-[560px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1
              id="create-group-title"
              class="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"
            >
              Create group
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Fill in the group details to start a new class.
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg bg-slate-100 px-2.5 py-2 text-slate-600 transition hover:bg-slate-200"
            (click)="closeRequested.emit()"
            aria-label="Close"
          >
            <span class="block text-xl leading-none">&times;</span>
          </button>
        </div>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="group-name"
                >Group name</label
              >
              <input
                id="group-name"
                name="name"
                type="text"
                [(ngModel)]="form.name"
                required
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                placeholder="Morning A1"
              />
            </div>

            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="group-code"
                >Code</label
              >
              <input
                id="group-code"
                name="code"
                type="text"
                [(ngModel)]="form.code"
                required
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                placeholder="CODE-101"
              />
            </div>
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              for="group-subject"
              >Subject (group program)</label
            >
            <select
              id="group-subject"
              name="subjectId"
              [ngModel]="form.subjectId"
              (ngModelChange)="onSubjectSelect($event)"
              [disabled]="subjectsLoading"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
            >
              <option value="">
                {{ subjectsLoading ? 'Loading subjects…' : 'Select subject' }}
              </option>
              @for (s of subjects; track s.id) {
                <option [value]="s.id">{{ s.title }}</option>
              }
              <option [value]="ADD_COURSE">+ Add course</option>
            </select>
            @if (showAddCoursePanel) {
              <div
                class="mt-2 rounded-lg border border-violet-200 bg-violet-50/80 p-3"
                role="region"
                aria-label="New course"
              >
                <p class="mb-2 text-xs font-medium text-slate-600">
                  New course name
                </p>
                <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    name="newSubjectTitle"
                    [(ngModel)]="newSubjectTitle"
                    placeholder="e.g. HTML, CSS, JavaScript"
                    class="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    (keydown.enter)="$event.preventDefault(); addCourse()"
                  />
                  <div class="flex shrink-0 gap-2">
                    <button
                      type="button"
                      class="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                      (click)="addCourse()"
                    >
                      Save course
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      (click)="cancelAddCourse()"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            }
            @if (subjectsLoadError) {
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <p class="text-xs text-red-600">{{ subjectsLoadError }}</p>
                <button
                  type="button"
                  class="text-xs font-semibold text-violet-700 underline hover:text-violet-900"
                  (click)="loadSubjects()"
                >
                  Retry
                </button>
              </div>
            }
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              for="group-teacher"
              >Teacher (optional)</label
            >
            <select
              id="group-teacher"
              name="teacherId"
              [(ngModel)]="form.teacherId"
              [disabled]="teachersLoading"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
            >
              <option value="">
                {{ teachersLoading ? 'Loading teachers…' : '— No teacher —' }}
              </option>
              @for (t of teachers; track t.id) {
                <option [value]="t.id">{{ t.displayName }}</option>
              }
            </select>
            @if (teachersLoadError) {
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <p class="text-xs text-red-600">{{ teachersLoadError }}</p>
                <button
                  type="button"
                  class="text-xs font-semibold text-violet-700 underline hover:text-violet-900"
                  (click)="loadTeachers()"
                >
                  Retry
                </button>
              </div>
            }
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="start-date"
                >Start date</label
              >
              <input
                id="start-date"
                name="startYmd"
                type="date"
                [(ngModel)]="form.startYmd"
                required
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="end-date"
                >End date</label
              >
              <input
                id="end-date"
                name="endYmd"
                type="date"
                [(ngModel)]="form.endYmd"
                required
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              (click)="submit()"
              class="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Create group
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              (click)="closeRequested.emit()"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AddGroupModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly api = inject(SchoolAdminDashboardService);

  @Input() schoolId = '';
  @Output() closeRequested = new EventEmitter<void>();
  @Output() createGroup = new EventEmitter<AddGroupPayload>();

  /** Sentinel value for the “+ Add course” row in &lt;select&gt; (not a real UUID). */
  readonly ADD_COURSE = '__add_course__';

  subjects: SchoolSubject[] = [];
  teachers: SchoolTeacher[] = [];
  newSubjectTitle = '';
  subjectsLoadError = '';
  subjectsLoading = false;
  teachersLoadError = '';
  teachersLoading = false;
  showAddCoursePanel = false;

  readonly form: {
    name: string;
    code: string;
    subjectId: string;
    teacherId: string;
    startYmd: string;
    endYmd: string;
    startDate: string;
    endDate: string;
  } = {
    name: '',
    code: '',
    subjectId: '',
    teacherId: '',
    startYmd: this.ymdToday(),
    endYmd: this.ymdInOneMonth(),
    startDate: '',
    endDate: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schoolId'] && this.schoolId) {
      this.loadSubjects();
      this.loadTeachers();
    }
  }

  ngOnInit(): void {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (this.schoolId) {
      this.loadSubjects();
      this.loadTeachers();
    }
  }

  ngOnDestroy(): void {
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeRequested.emit();
  }

  loadSubjects(): void {
    if (!this.schoolId) {
      return;
    }
    this.subjectsLoading = true;
    this.subjectsLoadError = '';
    this.api.listSubjects(this.schoolId).subscribe({
      next: (list) => {
        this.subjects = list;
        this.subjectsLoading = false;
      },
      error: () => {
        this.subjectsLoading = false;
        this.subjectsLoadError =
          'Could not load subjects. Is the backend running and migration V5 applied?';
      },
    });
  }

  loadTeachers(): void {
    if (!this.schoolId) {
      return;
    }
    this.teachersLoading = true;
    this.teachersLoadError = '';
    this.api.listTeachers(this.schoolId).subscribe({
      next: (list) => {
        this.teachers = list;
        this.teachersLoading = false;
      },
      error: () => {
        this.teachersLoading = false;
        this.teachersLoadError =
          'Could not load teachers. Is the backend running and migration V6 applied?';
      },
    });
  }

  onSubjectSelect(value: string): void {
    if (value === this.ADD_COURSE) {
      this.showAddCoursePanel = true;
      this.newSubjectTitle = '';
      queueMicrotask(() => {
        this.form.subjectId = '';
      });
      return;
    }
    this.showAddCoursePanel = false;
    this.form.subjectId = value;
  }

  cancelAddCourse(): void {
    this.showAddCoursePanel = false;
    this.newSubjectTitle = '';
  }

  addCourse(): void {
    const title = this.newSubjectTitle.trim();
    if (!title || !this.schoolId) {
      return;
    }
    this.api.createSubject(this.schoolId, title).subscribe({
      next: (created) => {
        const next = [...this.subjects.filter((s) => s.id !== created.id), created].sort(
          (a, b) => a.title.localeCompare(b.title),
        );
        this.subjects = next;
        this.form.subjectId = created.id;
        this.newSubjectTitle = '';
        this.showAddCoursePanel = false;
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'Failed to create course';
        window.alert(String(msg));
      },
    });
  }

  private ymdToday(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private ymdInOneMonth(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  private ymdToDdMmYyyy(ymd: string): string {
    const [y, m, d] = ymd.split('-');
    if (!y || !m || !d) return ymd;
    const pad2 = (v: string) => v.padStart(2, '0');
    return `${pad2(d)}.${pad2(m)}.${y}`;
  }

  submit(): void {
    const sid = this.form.subjectId?.trim();
    if (!sid) {
      window.alert('Please select a subject or add a new course from the list.');
      return;
    }
    const tid = this.form.teacherId?.trim();
    const payload: AddGroupPayload = {
      name: this.form.name.trim(),
      code: this.form.code.trim(),
      subjectId: sid || null,
      teacherId: tid || null,
      topicsLabel: sid ? '' : '',
      startDate: this.ymdToDdMmYyyy(this.form.startYmd),
      endDate: this.ymdToDdMmYyyy(this.form.endYmd),
      studentsCount: 0,
      active: true,
    };
    this.createGroup.emit(payload);
  }
}
