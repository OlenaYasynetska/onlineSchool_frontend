import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { AuthPlansBackdropComponent } from '../../components/auth-plans-backdrop/auth-plans-backdrop.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent, AuthPlansBackdropComponent],
  template: `
    <app-auth-plans-backdrop
      ariaLabelledBy="register-title"
      (backdropClick)="close()"
    >
      <div class="container">
        <!-- Центрируем карточку регистрации; на md+ делаем контейнер 50% -->
        <div class="relative mx-auto w-full max-w-[520px] md:w-1/2">
          <div class="relative z-10 w-full">
            <app-register-form
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
