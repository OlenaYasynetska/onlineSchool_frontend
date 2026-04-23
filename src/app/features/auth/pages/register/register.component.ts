import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterModalComponent } from '../../components/register-modal/register-modal.component';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';
import { REGISTER_AUTH_SHELL_CLASS } from '../../register-auth-shell';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RegisterModalComponent, AuthPlansBackdropComponent],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="register-title"
      [shellClass]="registerAuthShellClass"
      (backdropClick)="close()"
    >
      <div class="container px-2 sm:px-4">
        <!-- Та сама схема, що на логіні: 3 плани на фоні, модалка поверх -->
        <div class="relative mx-auto w-full max-w-[520px]">
          <div class="relative z-10 w-full">
            <app-register-modal
              class="relative block w-full"
              [initialPlan]="planFromRoute"
              (closeRequested)="close()"
            />
          </div>
          <div
            class="absolute top-1/2 -right-28 z-0 w-[min(320px,68vw)] max-w-[440px] -translate-y-[calc(50%+15.5rem)] sm:-right-28 sm:w-[min(340px,62vw)] md:-right-40 md:max-w-[460px] lg:-right-48 xl:-right-56"
            aria-hidden="true"
          >
            <img
              src="/assets/images/owl_sign_up.png"
              alt=""
              class="h-auto w-full select-none object-contain object-right drop-shadow-xl"
              width="320"
              height="400"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </app-auth-plans-backdrop>
  `,
})
export class RegisterComponent implements OnInit, OnDestroy {
  readonly registerAuthShellClass = REGISTER_AUTH_SHELL_CLASS;

  planFromRoute: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.planFromRoute = this.route.snapshot.queryParamMap.get('plan');
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
