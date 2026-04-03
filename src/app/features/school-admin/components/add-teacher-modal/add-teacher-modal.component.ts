import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

export type AddTeacherPayload = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  /** Кожен елемент — окремий рядок у таблиці `teacher_subjects`. */
  subjects?: string[];
};

@Component({
  selector: 'app-add-teacher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden bg-slate-900/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-teacher-title"
      (click)="$event.stopPropagation()"
    >
      <div
        class="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1
              id="add-teacher-title"
              class="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"
            >
              Add teacher
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Create an account for a teacher at your school. They can sign in with this email and
              password.
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

        <form
          #teacherForm="ngForm"
          novalidate
          (ngSubmit)="submit(teacherForm)"
          class="space-y-4"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="teacher-first-name"
                >First name</label
              >
              <input
                id="teacher-first-name"
                name="firstName"
                type="text"
                [(ngModel)]="form.firstName"
                required
                minlength="2"
                maxlength="100"
                [pattern]="namePattern"
                autocomplete="given-name"
                #firstNameModel="ngModel"
                class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-100"
                [class.border-slate-200]="!(firstNameModel.invalid && firstNameModel.touched)"
                [class.border-red-500]="firstNameModel.invalid && firstNameModel.touched"
                [class.focus:border-violet-400]="!(firstNameModel.invalid && firstNameModel.touched)"
              />
              @if (firstNameModel.invalid && firstNameModel.touched) {
                <p class="mt-1 text-xs text-red-600">
                  @if (firstNameModel.errors?.['required']) {
                    Enter a first name.
                  } @else if (firstNameModel.errors?.['minlength']) {
                    At least 2 characters.
                  } @else if (firstNameModel.errors?.['maxlength']) {
                    Max 100 characters.
                  } @else if (firstNameModel.errors?.['pattern']) {
                    Use letters, spaces, or hyphen (Latin or Cyrillic).
                  }
                </p>
              }
            </div>
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="teacher-last-name"
                >Last name</label
              >
              <input
                id="teacher-last-name"
                name="lastName"
                type="text"
                [(ngModel)]="form.lastName"
                required
                minlength="2"
                maxlength="100"
                [pattern]="namePattern"
                autocomplete="family-name"
                #lastNameModel="ngModel"
                class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-100"
                [class.border-slate-200]="!(lastNameModel.invalid && lastNameModel.touched)"
                [class.border-red-500]="lastNameModel.invalid && lastNameModel.touched"
                [class.focus:border-violet-400]="!(lastNameModel.invalid && lastNameModel.touched)"
              />
              @if (lastNameModel.invalid && lastNameModel.touched) {
                <p class="mt-1 text-xs text-red-600">
                  @if (lastNameModel.errors?.['required']) {
                    Enter a last name.
                  } @else if (lastNameModel.errors?.['minlength']) {
                    At least 2 characters.
                  } @else if (lastNameModel.errors?.['maxlength']) {
                    Max 100 characters.
                  } @else if (lastNameModel.errors?.['pattern']) {
                    Use letters, spaces, or hyphen (Latin or Cyrillic).
                  }
                </p>
              }
            </div>
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              for="teacher-email"
              >Email</label
            >
            <input
              id="teacher-email"
              name="email"
              type="email"
              [(ngModel)]="form.email"
              required
              maxlength="255"
              [pattern]="emailPattern"
              autocomplete="email"
              #emailModel="ngModel"
              class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-100"
              [class.border-slate-200]="!(emailModel.invalid && emailModel.touched)"
              [class.border-red-500]="emailModel.invalid && emailModel.touched"
              [class.focus:border-violet-400]="!(emailModel.invalid && emailModel.touched)"
            />
            @if (emailModel.invalid && emailModel.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (emailModel.errors?.['required']) {
                  Enter an email address.
                } @else if (emailModel.errors?.['pattern'] || emailModel.errors?.['email']) {
                  Enter a valid email (e.g. name&#64;school.com).
                } @else if (emailModel.errors?.['maxlength']) {
                  Email is too long.
                }
              </p>
            }
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              for="teacher-password"
              >Password</label
            >
            <input
              id="teacher-password"
              name="password"
              type="password"
              [(ngModel)]="form.password"
              required
              minlength="8"
              maxlength="128"
              autocomplete="new-password"
              #passwordModel="ngModel"
              class="w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-100"
              [class.border-slate-200]="!(passwordModel.invalid && passwordModel.touched)"
              [class.border-red-500]="passwordModel.invalid && passwordModel.touched"
              [class.focus:border-violet-400]="!(passwordModel.invalid && passwordModel.touched)"
            />
            <p class="mt-1 text-xs text-slate-500">8–128 characters.</p>
            @if (passwordModel.invalid && passwordModel.touched) {
              <p class="mt-1 text-xs text-red-600">
                @if (passwordModel.errors?.['required']) {
                  Enter a password.
                } @else if (passwordModel.errors?.['minlength']) {
                  Password must be at least 8 characters.
                } @else if (passwordModel.errors?.['maxlength']) {
                  Password is too long (max 128).
                }
              </p>
            }
          </div>

          <div>
            <label
              class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              for="teacher-subject"
              >Subject (optional)</label
            >
            <div class="flex flex-col gap-2">
              @for (line of subjectLines; track $index) {
                <div class="flex items-center gap-2">
                  <input
                    [attr.id]="$index === 0 ? 'teacher-subject' : 'teacher-subject-' + $index"
                    [name]="'subject_' + $index"
                    type="text"
                    [(ngModel)]="subjectLines[$index]"
                    maxlength="255"
                    [attr.placeholder]="$index === 0 ? 'e.g. Mathematics' : 'Another subject'"
                    class="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  />
                  @if ($index > 0) {
                    <button
                      type="button"
                      class="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      (click)="removeSubjectLine($index)"
                      [attr.aria-label]="'Remove subject ' + ($index + 1)"
                    >
                      ×
                    </button>
                  } @else {
                    <span class="w-9 shrink-0" aria-hidden="true"></span>
                  }
                </div>
              }
              <div class="flex justify-start">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-300 bg-violet-50 text-lg font-semibold leading-none text-violet-700 shadow-sm transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                  (click)="addSubjectLine()"
                  [disabled]="subjectLines.length >= maxSubjectLines"
                  aria-label="Add another subject field"
                >
                  +
                </button>
              </div>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              Each line is saved as a separate row (max {{ maxTotalSubjectChars }} characters per
              subject).
            </p>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              class="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Add teacher
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
export class AddTeacherModalComponent implements OnInit, OnDestroy {
  @Input() schoolId = '';
  @Output() closeRequested = new EventEmitter<void>();
  /** Не називати `createTeacher` — конфлікт імені з DOM-подією submit. */
  @Output() teacherSubmit = new EventEmitter<AddTeacherPayload>();

  /** Латиниця, кирилиця, пробіли, дефіс, апостроф. */
  readonly namePattern = "^[a-zA-Zа-яА-ЯіІїЇєЄґҐёЁ\\s\\-']{2,100}$";

  readonly emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

  /** Окремі рядки предметів; у БД зберігаються як один рядок через кому. */
  subjectLines: string[] = [''];

  readonly maxSubjectLines = 12;
  readonly maxTotalSubjectChars = 255;

  readonly form: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  };

  addSubjectLine(): void {
    if (this.subjectLines.length >= this.maxSubjectLines) {
      return;
    }
    this.subjectLines = [...this.subjectLines, ''];
  }

  removeSubjectLine(index: number): void {
    if (index <= 0 || this.subjectLines.length <= 1) {
      return;
    }
    this.subjectLines = this.subjectLines.filter((_, i) => i !== index);
  }

  ngOnInit(): void {
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

  submit(form: NgForm): void {
    if (!this.schoolId) {
      return;
    }
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }
    const first = this.form.firstName.trim();
    const last = this.form.lastName.trim();
    if (first.length < 2 || last.length < 2) {
      form.control.markAllAsTouched();
      return;
    }
    const p = this.form.password ?? '';
    const parts = this.subjectLines.map((s) => s.trim()).filter((s) => s.length > 0);
    for (const s of parts) {
      if (s.length > this.maxTotalSubjectChars) {
        form.control.markAllAsTouched();
        window.alert(`Each subject must be at most ${this.maxTotalSubjectChars} characters.`);
        return;
      }
    }
    const payload: AddTeacherPayload = {
      firstName: first,
      lastName: last,
      email: this.form.email.trim().toLowerCase(),
      password: p,
      subjects: parts.length > 0 ? parts : undefined,
    };
    this.teacherSubmit.emit(payload);
  }
}
