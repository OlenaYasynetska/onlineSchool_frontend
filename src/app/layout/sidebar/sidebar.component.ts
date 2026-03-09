import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <nav class="flex-1 space-y-1 p-4">
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-primary/10 text-primary"
          class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Dashboard
        </a>
        <a
          routerLink="/students"
          routerLinkActive="bg-primary/10 text-primary"
          class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Учні
        </a>
        <a
          routerLink="/teachers"
          routerLinkActive="bg-primary/10 text-primary"
          class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Вчителі
        </a>
        <a
          routerLink="/schools"
          routerLinkActive="bg-primary/10 text-primary"
          class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Школи
        </a>
        <a
          routerLink="/analytics"
          routerLinkActive="bg-primary/10 text-primary"
          class="block rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Аналітика
        </a>
      </nav>
    </aside>
  `,
})
export class SidebarComponent {}
