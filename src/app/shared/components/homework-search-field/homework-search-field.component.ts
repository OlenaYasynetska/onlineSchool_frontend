import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Поле поиску з іконкою «лупа + стовпчики» у лінзі (як у референс-макеті).
 */
@Component({
  selector: 'app-homework-search-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full max-w-md">
      <span
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
        aria-hidden="true"
      >
        <svg
          class="h-5 w-5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <clipPath [attr.id]="clipId">
              <circle cx="10" cy="10" r="4.5" />
            </clipPath>
          </defs>
          <circle cx="10" cy="10" r="5" stroke="currentColor" stroke-width="1.75" fill="none" />
          <g [attr.clip-path]="'url(#' + clipId + ')'" fill="currentColor">
            <rect x="6.2" y="9" width="1.15" height="4" rx="0.25" />
            <rect x="7.85" y="7.5" width="1.15" height="6" rx="0.25" />
            <rect x="9.5" y="9.5" width="1.15" height="3" rx="0.25" />
            <rect x="11.15" y="8" width="1.15" height="5" rx="0.25" />
          </g>
          <line
            x1="14"
            y1="14"
            x2="19.5"
            y2="19.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <input
        type="search"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"
        class="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
        autocomplete="off"
      />
    </div>
  `,
})
export class HomeworkSearchFieldComponent {
  @Input() placeholder = 'Search';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  private static nextId = 0;
  readonly clipId = `hw-search-clip-${HomeworkSearchFieldComponent.nextId++}`;

  onChange(v: string): void {
    this.valueChange.emit(v);
  }
}
