import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Учні</h1>
      <app-card>
        <p class="text-gray-500">Список учнів (placeholder)</p>
      </app-card>
    </div>
  `,
})
export class StudentsListComponent {}
