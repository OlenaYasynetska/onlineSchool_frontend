import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-motivation-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p
      class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 font-semibold text-slate-800 shadow-sm"
      style="font-size: clamp(0.68rem, 1vw, 0.9rem)"
    >
      <img
        src="/assets/icons/Clip path group.svg"
        alt="Motivation icon"
        class="h-8 w-8 object-contain"
      />
      The right motivation for great achievements
    </p>
  `,
})
export class MotivationBadgeComponent {}

