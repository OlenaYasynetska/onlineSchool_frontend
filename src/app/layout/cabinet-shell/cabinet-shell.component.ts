import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Оболонка кабінету (school-admin / teacher / student): лише внутрішній outlet.
 * Header, footer і sidebar залишаються в {@link MainLayoutComponent}.
 */
@Component({
  selector: 'app-cabinet-shell',
  standalone: true,
  imports: [RouterOutlet],
  host: {
    class: 'flex min-h-0 min-w-0 w-full flex-1 flex-col',
  },
  template: `
    <div class="flex min-h-0 min-w-0 flex-1 flex-col">
      <router-outlet />
    </div>
  `,
})
export class CabinetShellComponent {}
