import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type {
  SchoolGroupCard,
  SchoolSubject,
  SchoolTeacher,
} from '../../models/school-admin-dashboard.model';
import type { AddGroupPayload } from '../add-group-modal/add-group-modal.component';
import { SchoolAdminDashboardService } from '../../services/school-admin-dashboard.service';

type EditGroupPayload = AddGroupPayload;

@Component({
  selector: 'app-edit-group-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-[101] isolate flex items-center justify-center overflow-hidden bg-slate-900/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-group-title"
      data-edit-group-modal="true"
      (click)="closeRequested.emit()"
    >
      <div
        class="relative z-10 w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <h1
            id="edit-group-title"
            class="min-w-0 pr-2 text-xl font-bold leading-snug text-slate-800"
          >
            Edit group
          </h1>
          <button
            type="button"
            class="shrink-0 rounded-lg bg-slate-100 px-2.5 py-2 text-slate-600 transition hover:bg-slate-200"
            (click)="closeRequested.emit()"
            aria-label="Close"
          >
            <span class="block text-xl leading-none">&times;</span>
          </button>
        </div>

        <form (ngSubmit)="apply()" class="space-y-0">
          <div
            class="grid grid-cols-[minmax(8.5rem,9.5rem)_minmax(0,1fr)] items-center gap-x-3 gap-y-3"
          >
            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-group-name"
              >Group name:</label
            >
            <input
              id="edit-group-name"
              name="name"
              type="text"
              [(ngModel)]="form.name"
              required
              class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-group-code"
              >Group code:</label
            >
            <input
              id="edit-group-code"
              name="code"
              type="text"
              [(ngModel)]="form.code"
              required
              maxlength="255"
              class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-group-subject"
              >Group program:</label
            >
            <div class="flex min-w-0 flex-col gap-2">
              <select
                id="edit-group-subject"
                name="subjectId"
                [ngModel]="form.subjectId"
                (ngModelChange)="onSubjectSelect($event)"
                [disabled]="subjectsLoading"
                class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:opacity-60"
              >
                <option value="">
                  {{ subjectsLoading ? 'Loading subjects…' : 'Text only (not in catalog)' }}
                </option>
                @for (s of subjects; track s.id) {
                  <option [value]="s.id">{{ s.title }}</option>
                }
                <option [value]="ADD_COURSE">+ Add course</option>
              </select>
              @if (!form.subjectId && !showAddCoursePanel) {
                <input
                  type="text"
                  name="topicsLabel"
                  [(ngModel)]="form.topicsLabel"
                  required
                  placeholder="Subject / program name"
                  class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              }
              @if (showAddCoursePanel) {
                <div
                  class="rounded-md border border-violet-200 bg-violet-50/80 p-3"
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
                      class="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                      (keydown.enter)="$event.preventDefault(); addCourse()"
                    />
                    <div class="flex shrink-0 gap-2">
                      <button
                        type="button"
                        class="rounded-md bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                        (click)="addCourse()"
                      >
                        Save course
                      </button>
                      <button
                        type="button"
                        class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        (click)="cancelAddCourse()"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              }
              @if (subjectsLoadError) {
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="text-red-600">{{ subjectsLoadError }}</span>
                  <button
                    type="button"
                    class="font-semibold text-violet-700 underline hover:text-violet-900"
                    (click)="loadSubjects()"
                  >
                    Retry
                  </button>
                </div>
              }
              <label
                class="flex cursor-pointer items-start gap-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  name="showSubjectOnCard"
                  [(ngModel)]="form.showSubjectOnCard"
                  class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Show course code and subject on the group card</span>
              </label>
            </div>

            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-group-teacher"
              >Teacher:</label
            >
            <div class="flex min-w-0 flex-col gap-2">
              <select
                id="edit-group-teacher"
                name="teacherId"
                [(ngModel)]="form.teacherId"
                [disabled]="teachersLoading"
                class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:opacity-60"
              >
                <option value="">
                  {{ teachersLoading ? 'Loading…' : '— No teacher —' }}
                </option>
                @for (t of teachers; track t.id) {
                  <option [value]="t.id">{{ t.displayName }}</option>
                }
              </select>
              @if (teachersLoadError) {
                <div class="flex flex-wrap items-center gap-2 text-xs">
                  <span class="text-red-600">{{ teachersLoadError }}</span>
                  <button
                    type="button"
                    class="font-semibold text-violet-700 underline hover:text-violet-900"
                    (click)="loadTeachers()"
                  >
                    Retry
                  </button>
                </div>
              }
            </div>

            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-start-date"
              >Start date:</label
            >
            <input
              id="edit-start-date"
              name="startYmd"
              type="date"
              [(ngModel)]="form.startYmd"
              required
              class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />

            <label
              class="text-right text-sm font-normal leading-snug text-slate-700"
              for="edit-end-date"
              >End date:</label
            >
            <input
              id="edit-end-date"
              name="endYmd"
              type="date"
              [(ngModel)]="form.endYmd"
              required
              class="min-w-0 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <p class="mt-8 text-center text-xs leading-relaxed text-slate-500">
            <strong class="text-slate-600">Save</strong> sends changes to the server.
            <strong class="text-slate-600">Revert</strong> restores the form to how it was when
            you opened this dialog (nothing is saved).
          </p>
          <div class="mt-3 flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              class="w-[128px] rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-none transition hover:bg-slate-800"
              (click)="revert()"
            >
              Revert
            </button>
            <button
              type="button"
              class="w-[128px] rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-none transition hover:bg-orange-600"
              (click)="apply()"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class EditGroupModalComponent implements OnChanges, OnInit, OnDestroy {
  private readonly api = inject(SchoolAdminDashboardService);

  @Input() schoolId = '';
  @Input() group: SchoolGroupCard | null = null;
  @Output() closeRequested = new EventEmitter<void>();
  @Output() applyGroup = new EventEmitter<EditGroupPayload>();

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
    topicsLabel: string;
    startYmd: string;
    endYmd: string;
    studentsCount: number;
    active: boolean;
    showSubjectOnCard: boolean;
  } = {
    name: '',
    code: '',
    subjectId: '',
    teacherId: '',
    topicsLabel: '',
    startYmd: '',
    endYmd: '',
    studentsCount: 0,
    active: true,
    showSubjectOnCard: true,
  };

  /** Snapshot of the form when the dialog opened (revert target). Not API-shaped — avoids losing `topicsLabel` when a catalog subject is selected. */
  private formSnapshotWhenOpened: {
    name: string;
    code: string;
    subjectId: string;
    teacherId: string;
    topicsLabel: string;
    startYmd: string;
    endYmd: string;
    studentsCount: number;
    active: boolean;
    showSubjectOnCard: boolean;
  } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (this.schoolId && (changes['schoolId'] || changes['group'])) {
      this.loadSubjects();
      this.loadTeachers();
    }
    if (!this.group) {
      return;
    }
    const g = this.group;

    const startYmd = this.groupApiDateToYmd(g.startDate);
    const endYmd = this.groupApiDateToYmd(g.endDate);

    this.form.name = g.name ?? '';
    this.form.code = g.code ?? '';
    this.form.subjectId = g.subjectId ?? '';
    this.form.teacherId = g.teacherId ?? '';
    this.form.topicsLabel = g.topicsLabel ?? '';
    this.form.startYmd = startYmd;
    this.form.endYmd = endYmd;
    this.form.studentsCount = Number(g.studentsCount ?? 0);
    this.form.active = Boolean(g.active);
    this.form.showSubjectOnCard = g.showSubjectOnCard !== false;
    this.showAddCoursePanel = false;
    this.newSubjectTitle = '';

    this.formSnapshotWhenOpened = {
      name: this.form.name,
      code: this.form.code,
      subjectId: this.form.subjectId,
      teacherId: this.form.teacherId,
      topicsLabel: this.form.topicsLabel,
      startYmd: this.form.startYmd,
      endYmd: this.form.endYmd,
      studentsCount: this.form.studentsCount,
      active: this.form.active,
      showSubjectOnCard: this.form.showSubjectOnCard,
    };
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

  ngOnInit(): void {
    // Prevent background scrolling while modal is open.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeRequested.emit();
  }

  /** Restores the form to values when you opened this dialog (does not call the server). */
  revert(): void {
    const s = this.formSnapshotWhenOpened;
    if (!s) {
      return;
    }
    this.form.name = s.name;
    this.form.code = s.code;
    this.form.subjectId = s.subjectId;
    this.form.teacherId = s.teacherId;
    this.form.topicsLabel = s.topicsLabel;
    this.form.startYmd = s.startYmd;
    this.form.endYmd = s.endYmd;
    this.form.studentsCount = s.studentsCount;
    this.form.active = s.active;
    this.form.showSubjectOnCard = s.showSubjectOnCard;
    this.showAddCoursePanel = false;
    this.newSubjectTitle = '';
  }

  apply(): void {
    if (!this.group?.id?.trim()) {
      window.alert(
        'Group id is missing. Close this dialog and open the group again from the list.',
      );
      return;
    }
    const sid = this.form.subjectId?.trim();
    if (!sid && !(this.form.topicsLabel ?? '').trim()) {
      window.alert(
        'Select a subject, add a new course from the list (+ Add course), or enter a text program name.',
      );
      return;
    }
    this.applyGroup.emit(this.formToPayload());
  }

  private formToPayload(): EditGroupPayload {
    const sid = this.form.subjectId?.trim();
    const tid = this.form.teacherId?.trim();
    return {
      name: this.form.name.trim(),
      code: this.form.code.trim(),
      subjectId: sid || null,
      teacherId: tid || null,
      topicsLabel: sid ? '' : (this.form.topicsLabel ?? '').trim(),
      startDate: this.ymdToDdMmYyyy(this.form.startYmd),
      endDate: this.ymdToDdMmYyyy(this.form.endYmd),
      studentsCount: Number(this.form.studentsCount) || 0,
      active: this.form.active,
      // Явне true/false: JSON.stringify опускає undefined, тоді бекенд бачить null і лишає «показувати».
      showSubjectOnCard: this.form.showSubjectOnCard !== false,
      groupId: this.group!.id,
    };
  }

  private ymdToDdMmYyyy(ymd: string): string {
    // Input: YYYY-MM-DD
    const [y, m, d] = ymd.split('-');
    if (!y || !m || !d) return ymd;
    const pad2 = (v: string) => v.padStart(2, '0');
    return `${pad2(d)}.${pad2(m)}.${y}`;
  }

  /**
   * Dashboard groups use `yyyy-MM-dd`; POST /groups responses use `dd.MM.yyyy`.
   * `<input type="date">` needs `yyyy-MM-dd`.
   */
  private groupApiDateToYmd(raw: string): string {
    if (!raw || raw === '—') return '';
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return s;
    }
    const parts = s.split('.');
    if (parts.length !== 3) return '';
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy) return '';
    const pad2 = (v: string) => v.padStart(2, '0');
    return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
  }
}

