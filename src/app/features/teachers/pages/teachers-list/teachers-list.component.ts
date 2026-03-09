import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-teachers-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Вчителі</h1>
      <app-card>
        <p class="text-gray-500">Список вчителів (placeholder)</p>
      </app-card>
    </div>
  `,
})
export class TeachersListComponent {}
