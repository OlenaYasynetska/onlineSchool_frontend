import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Placeholder until real chat is wired; entry from teacher/student sidebar FAB. */
@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-lg font-semibold text-slate-900 dark:text-white">Chat</h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        This section is under construction.
      </p>
    </div>
  `,
})
export class ChatPageComponent {}
