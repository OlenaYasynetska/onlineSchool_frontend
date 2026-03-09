import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-card>
          <p class="text-sm text-gray-500">Учні</p>
          <p class="text-2xl font-semibold">—</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Вчителі</p>
          <p class="text-2xl font-semibold">—</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Школи</p>
          <p class="text-2xl font-semibold">—</p>
        </app-card>
        <app-card>
          <p class="text-sm text-gray-500">Курси</p>
          <p class="text-2xl font-semibold">—</p>
        </app-card>
      </div>
    </div>
  `,
})
export class DashboardPageComponent {}
