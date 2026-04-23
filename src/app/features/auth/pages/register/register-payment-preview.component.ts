import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegisterModalComponent } from '../../components/register-modal/register-modal.component';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';
import { REGISTER_AUTH_SHELL_CLASS } from '../../register-auth-shell';

/**
 * Демо-маршрут: одразу показує вікно оплати без реєстрації.
 * Відкрийте: /auth/register/payment-preview
 */
@Component({
  selector: 'app-register-payment-preview',
  standalone: true,
  imports: [CommonModule, RegisterModalComponent, AuthPlansBackdropComponent],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="payment-modal-title"
      [shellClass]="registerAuthShellClass"
      (backdropClick)="close()"
    >
      <div class="container px-2 sm:px-4">
        <div class="relative z-10 mx-auto w-full max-w-[min(100%,520px)]">
          <app-register-modal (closeRequested)="close()" />
        </div>
      </div>
    </app-auth-plans-backdrop>
  `,
})
export class RegisterPaymentPreviewComponent implements OnInit, OnDestroy {
  readonly registerAuthShellClass = REGISTER_AUTH_SHELL_CLASS;

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
