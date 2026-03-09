import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-schools-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Школи</h1>
      <app-card>
        <p class="text-gray-500">Список шкіл (placeholder)</p>
      </app-card>
    </div>
  `,
})
export class SchoolsListComponent {}
