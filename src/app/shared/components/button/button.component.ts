import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="buttonClass()"
      (click)="click.emit($event)"
    >
      @if (loading()) {
        <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      }
      <ng-content />
    </button>
  `,
  styles: ``,
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  variant = input<'primary' | 'secondary' | 'outline' | 'ghost'>('primary');
  disabled = input(false);
  loading = input(false);

  private base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition disabled:opacity-50';
  buttonClass = input(this.base);

  click = output<MouseEvent>();
}
