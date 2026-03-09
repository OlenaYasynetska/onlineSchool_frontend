import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-8">
      <span
        class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      ></span>
    </div>
  `,
})
export class LoaderComponent {}
