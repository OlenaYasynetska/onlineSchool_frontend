import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotivationBadgeComponent } from '../../../../shared/components/motivation-badge/motivation-badge.component';
import { usePlans } from '../../hooks/use-plans.hook';
import { useLandingButtons } from '../../hooks/use-landing-buttons.hook';
import { useHeroContent } from '../../hooks/use-hero-content.hook';
import { useAboutCards } from '../../hooks/use-about-cards.hook';
import { useFaq } from '../../hooks/use-faq.hook';
import { useLandingSections } from '../../hooks/use-landing-sections.hook';
import { FaqAccordionComponent } from '../../components/faq-accordion/faq-accordion.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    MotivationBadgeComponent,
    FaqAccordionComponent,
    FooterComponent,
    RouterLink,
  ],
  host: {
    class: 'block min-h-full w-full',
  },
  template: `
    <div class="min-h-full bg-[#FDF6E9]">
      <!-- Hero: full-width gradient (aligned with header strip), content like other sections -->
      <section
        class="relative -mt-px w-full overflow-hidden bg-gradient-to-br from-[#FF7A18] via-[#FFC857] to-[#FFF1B8] bg-fixed"
      >
        <div class="container flex w-full flex-col px-4 py-10 md:px-8 md:py-14">
          <div
            class="grid w-full items-center gap-8 min-[400px]:grid-cols-[1fr_auto] md:gap-10 lg:gap-12"
          >
            <div class="max-w-xl space-y-6">
              <app-motivation-badge />

              <div class="space-y-4">
                <h1
                  class="font-extrabold leading-tight text-slate-900"
                  style="font-size: clamp(1.6rem, 4.2vw, 4rem); line-height: 1.08"
                >
                  {{ hero.titleLines[0] }}<br />
                  {{ hero.titleLines[1] }}
                </h1>

                <p
                  class="max-w-md text-slate-800"
                  style="font-size: clamp(0.95rem, 1.35vw, 1.2rem); line-height: 1.45"
                >
                  {{ hero.description }}
                </p>
              </div>

              <a routerLink="/auth/register" [class]="buttons.subscribeNow.className">
                {{ buttons.subscribeNow.label }}
              </a>
            </div>

            <div class="hidden min-[500px]:max-[766px]:block justify-self-end">
              <img
                src="/assets/images/owl_hero_hendy.png"
                alt="Owl hero mobile"
                class="h-auto w-[clamp(200px,36vw,320px)] object-contain drop-shadow-2xl"
              />
            </div>

            <div class="hidden justify-self-end md:block">
              <img
                src="/assets/images/owl_hero.png"
                alt="Owl hero"
                class="h-auto w-[min(42vw,480px)] max-w-full object-contain lg:w-[min(38vw,520px)] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div class="w-full overflow-hidden">
        <!-- About section -->
        <section class="bg-[#FDF6E9] px-4 py-12 md:px-8 md:py-16">
          <div class="container w-full">
            <h2 class="mb-10 text-center text-4xl font-bold text-[#213855]">
              {{ sections.aboutTitle }}
            </h2>

            <div
              class="relative mx-auto flex w-full max-w-[1174px] flex-col gap-4 rounded-2xl bg-[#FDF6E9] px-6 py-8 md:px-10"
            >
              @for (card of aboutCards(); track card.id; let i = $index) {
                <div
                  [class]="card.containerClass + ' about-card-trigger about-card ' + (i % 2 === 0 ? 'about-card--from-left' : 'about-card--from-right')"
                  [style.--reveal-delay]="(i * 160) + 'ms'"
                >
                  <div
                    class="flex h-10 w-10 flex-none items-center justify-center bg-transparent"
                  >
                    <img
                      [src]="card.iconSrc"
                      [alt]="card.iconAlt"
                      class="h-7 w-7 object-contain"
                    />
                  </div>
                  <div>
                    <h3 class="mb-1 text-base font-semibold text-[#213855]">
                      {{ card.title }}
                    </h3>
                    <p class="text-sm text-[#415873]">{{ card.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Wavy divider (white bar with wavy edges) -->
        <div class="relative h-20 overflow-hidden bg-[#FDF6E9]">
          <svg
            class="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
          >
            <!-- Верхняя волна -->
            <path
              d="M0 50 C 180 80 320 20 480 40 C 640 60 780 10 960 35 C 1140 60 1290 30 1440 45 L1440 0 L0 0 Z"
              fill="#FDF6E9"
            />
            <!-- Белая полоса с неровным низом -->
            <path
              d="M0 40 C 160 60 320 90 480 80 C 640 70 800 50 960 60 C 1120 70 1280 95 1440 80 L1440 160 L0 160 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <!-- Separate Plans section -->
        <section class="bg-[#FDF6E9] px-6 pt-14 pb-10 md:px-8 md:pt-16 md:pb-12">
          <div class="container w-full">
            <div class="mb-6">
              <h2 class="mb-1 text-center text-4xl font-bold text-[#213855]">
                {{ sections.plansTitle }}
              </h2>
              <p class="text-sm text-slate-700">
                Choose the best option for your school or start for free.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-3">
              @for (plan of plans(); track plan.id) {
                <article class="rounded-xl bg-white p-4 shadow-sm min-h-[420px]">
                  <img
                    [src]="plan.image"
                    [alt]="plan.title"
                    class="mb-3 h-[20rem] w-full rounded-lg object-cover"
                  />
                  <h3 class="text-lg font-semibold text-slate-900">{{ plan.title }}</h3>
                  <p class="mb-3 text-sm text-slate-600">{{ plan.subtitle }}</p>
                  <ul class="mb-4 space-y-1 text-xs text-slate-600">
                    @for (feature of plan.features; track feature) {
                      <li>{{ feature }}</li>
                    }
                  </ul>
                  <a
                    [routerLink]="['/auth/register']"
                    [queryParams]="{ plan: plan.id }"
                    [class]="buttons.subscribePlans.className"
                  >
                    {{ buttons.subscribePlans.label }}
                  </a>
                </article>
              }
            </div>
          </div>
        </section>

        <!-- Wavy divider between Plans and FAQ -->
        <div class="relative h-20 overflow-hidden bg-[#FDF6E9]">
          <svg
            class="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
          >
            <path
              d="M0 34 C 140 70 300 6 470 30 C 640 54 820 8 1000 28 C 1170 48 1310 24 1440 36 L1440 0 L0 0 Z"
              fill="#FDF6E9"
            />
            <path
              d="M0 58 C 130 90 280 122 450 104 C 620 86 780 46 960 62 C 1140 78 1285 120 1440 102 L1440 160 L0 160 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        <!-- FAQ section -->
        <app-faq-accordion
          [title]="sections.faqTitle"
          [tabs]="faq.tabs()"
          [questions]="faq.questions()"
        />

        <!-- Ready to get started module -->
        <section class="bg-[#FDF6E9] px-4 py-14 md:px-8 md:py-20">
          <div class="container w-full">
            <div
              class="flex flex-col items-center justify-between gap-10 rounded-3xl bg-white/50 px-8 py-10 md:flex-row md:gap-12"
            >
              <div class="max-w-xl text-center md:text-left">
                <h3 class="mb-2 text-3xl font-extrabold text-[#213855]">
                  {{ sections.readyTitle }}
                </h3>
                <p class="mb-6 text-sm text-[#415873]">
                  Join Owl Tracker today and unlock the motivation to reach your goals.
                </p>
                <a routerLink="/auth/register" [class]="buttons.subscribeNow.className">
                  {{ buttons.subscribeNow.label }}
                </a>
              </div>

              <div class="flex items-center justify-center">
                <img
                  src="/assets/images/owl_get_started.png"
                  alt="Owl get started"
                  class="w-[260px] md:w-[320px]"
                />
              </div>
            </div>
          </div>
        </section>

        <app-footer />
      </div>
    </div>
  `,
})
export class LandingComponent {
  readonly plans = usePlans();
  readonly hero = useHeroContent();
  readonly aboutCards = useAboutCards();
  readonly buttons = useLandingButtons();
  readonly faq = useFaq();
  readonly sections = useLandingSections();

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    // Анимация появления карточек при прокрутке (по очереди через delay по индексу).
    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.about-card-trigger'),
    );
    if (!els.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add('about-card--visible');
          this.observer?.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    els.forEach((el) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

