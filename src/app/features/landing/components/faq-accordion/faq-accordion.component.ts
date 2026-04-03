import { Component, Input, signal } from '@angular/core';
import type {
  FaqQuestion,
  FaqTab,
} from '../../hooks/use-faq.hook';

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  template: `
    <section class="bg-[#FDF6E9] px-6 py-12 md:px-8 md:py-16">
      <div class="mx-auto w-full max-w-[1280px]">
        <div class="mx-auto w-full max-w-4xl">
          <h2 class="mb-6 text-center text-4xl font-extrabold text-[#213855]">
            {{ title }}
          </h2>

          <div
            class="mb-5 flex items-center justify-center gap-10 text-sm font-semibold text-[#213855]"
          >
            @for (tab of tabs; track tab.id; let i = $index) {
              <button
                type="button"
                [class]="
                  tab.className +
                  (openTabIndex() === i
                    ? ' border-b-2 border-[#E6942E] pb-1'
                    : '')
                "
              >
                {{ tab.label }}
              </button>
            }
          </div>

          <div class="space-y-3">
            @for (q of questions; track q.id) {
              <div class="w-full">
                <button
                  type="button"
                  (click)="toggleFaq(q.id)"
                  [attr.aria-expanded]="openFaqId() === q.id"
                  class="flex w-full items-center justify-between rounded-lg bg-white px-4 py-3 text-left text-base text-[#213855] shadow-sm"
                >
                  <span>{{ q.text }}</span>
                  <span
                    class="text-lg leading-none transition-transform"
                    [class.rotate-180]="openFaqId() === q.id"
                  >
                    ⌄
                  </span>
                </button>

                @if (openFaqId() === q.id) {
                  <div class="px-4 pb-4 pt-3 text-sm text-[#415873]">
                    {{ q.answer }}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FaqAccordionComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) tabs: FaqTab[] = [];
  @Input({ required: true }) questions: FaqQuestion[] = [];

  readonly openFaqId = signal<string | null>(null);

  toggleFaq(id: string): void {
    this.openFaqId.set(this.openFaqId() === id ? null : id);
  }

  /** Index of opened accordion item → same index tab gets underline (0, 1, 2). */
  openTabIndex(): number | null {
    const id = this.openFaqId();
    if (!id) {
      return null;
    }
    const idx = this.questions.findIndex((q) => q.id === id);
    return idx >= 0 ? idx : null;
  }
}

