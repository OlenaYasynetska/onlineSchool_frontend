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
import type { SchoolGroupCard } from '../../models/school-admin-dashboard.model';
import { normalizeSchoolId } from '../../utils/school-id.util';

export type AddStudentPayload = {
  fullName: string;
  email: string;
  /** Після створення — зарахувати до існуючої групи (опційно). */
  groupId?: string;
};

@Component({
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden bg-slate-900/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-student-title"
      (click)="$event.stopPropagation()"
    >
      <div
        class="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200"
        (click)="$event.stopPropagation()"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1
              id="add-student-title"
              class="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"
            >
              Add student
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Register a student for your school. They appear in the students list; login can be
              added later if your flow uses accounts.
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
          #studentForm="ngForm"
          novalidate
          (ngSubmit)="submit(studentForm)"
          class="space-y-4"
        >
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="student-first-name"
                >First name</label
              >
              <input
                id="student-first-name"
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
                for="student-last-name"
                >Last name</label
              >
              <input
                id="student-last-name"
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
              for="student-email"
              >Email</label
            >
            <input
              id="student-email"
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

          @if (groups.length > 0) {
            <div>
              <label
                class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                for="student-group"
                >Add to group (optional)</label
              >
              <select
                id="student-group"
                name="groupId"
                [(ngModel)]="selectedGroupId"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-100"
              >
                <option value="">— Not now —</option>
                @for (g of groups; track g.id) {
                  <option [value]="g.id">{{ g.name }} ({{ g.code }})</option>
                }
              </select>
              <p class="mt-1 text-xs text-slate-500">
                Student is created first; you can assign them to an existing course group here.
              </p>
            </div>
          }

          <div class="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              class="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Add student
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
export class AddStudentModalComponent implements OnInit, OnDestroy {
  @Input() schoolId = '';
  @Input() groups: SchoolGroupCard[] = [];
  @Output() closeRequested = new EventEmitter<void>();
  @Output() studentSubmit = new EventEmitter<AddStudentPayload>();

  readonly namePattern = "^[a-zA-Zа-яА-ЯіІїЇєЄґҐёЁ\\s\\-']{2,100}$";
  readonly emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';

  readonly form: {
    firstName: string;
    lastName: string;
    email: string;
  } = {
    firstName: '',
    lastName: '',
    email: '',
  };

  /** Порожній рядок = не зараховувати до групи зараз. */
  selectedGroupId = '';

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
    if (!normalizeSchoolId(this.schoolId)) {
      window.alert(
        'School is not linked to your account (missing school id). You cannot add a student.'
      );
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
    const fullName = `${first} ${last}`.replace(/\s+/g, ' ').trim();
    const gid = this.selectedGroupId?.trim();
    this.studentSubmit.emit({
      fullName,
      email: this.form.email.trim().toLowerCase(),
      ...(gid ? { groupId: gid } : {}),
    });
  }
}
