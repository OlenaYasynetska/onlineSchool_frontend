import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-800">
      <div class="px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {{ year }} Education Platform
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
