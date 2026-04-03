import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';

/**
 * Демо-маршрут: одразу показує вікно оплати без реєстрації.
 * Відкрийте: /auth/register/payment-preview
 */
@Component({
  selector: 'app-register-payment-preview',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent],
  template: `
    <div
      class="fixed inset-0 z-[100] isolate flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF8EC] via-[#FDF6E9] to-[#FBE8D4] p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="relative z-20 w-full max-w-[min(100%,560px)]" (click)="$event.stopPropagation()">
        <app-register-form (closeRequested)="close()" />
      </div>
    </div>
  `,
})
export class RegisterPaymentPreviewComponent implements OnInit, OnDestroy {
  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  close(): void {
    void this.router.navigate(['/']);
  }
}
