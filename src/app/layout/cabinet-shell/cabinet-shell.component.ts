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
    class: 'flex min-w-0 w-full flex-col',
  },
  template: `<router-outlet />`,
})
export class CabinetShellComponent {}
