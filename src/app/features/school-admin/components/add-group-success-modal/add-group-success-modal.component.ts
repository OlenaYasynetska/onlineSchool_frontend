import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-group-success-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden bg-slate-900/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-success-title"
      (click)="$event.stopPropagation()"
    >
      <div class="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1
              id="group-success-title"
              class="text-xl font-bold leading-snug text-slate-900 sm:text-2xl"
            >
              Group added successfully
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Now you can add a teacher, students or create another group.
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

        <div class="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 ring-1 ring-violet-100">
              <svg
                class="h-7 w-7 text-violet-700"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p class="text-sm font-semibold text-slate-800">
              {{ message }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
              (click)="goHome()"
            >
              Back to home
            </button>
            <button
              type="button"
              class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              (click)="addAnother.emit()"
            >
              Add another group
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AddGroupSuccessModalComponent implements OnInit, OnDestroy {
  @Output() addAnother = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  @Input() message = '';

  constructor(private readonly router: Router) {}

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

  goHome(): void {
    this.closeRequested.emit();
    void this.router.navigate(['/school-admin']);
  }
}

