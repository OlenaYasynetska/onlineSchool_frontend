import { Component, computed, input, ViewEncapsulation } from '@angular/core';

/**
 * Відображає email як посилання mailto: у таблицях та картках.
 * Клік обробляється явно — так навігація не залежить від санітизації [href] у DOM.
 *
 * Без encapsulation: стилі посилання мають перемагати Tailwind preflight (a { color: inherit }) у td.
 */
@Component({
  selector: 'app-email-link',
  standalone: true,
  templateUrl: './email-link.component.html',
  styleUrl: './email-link.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class EmailLinkComponent {
  readonly email = input<string | null | undefined>();

  /** Текст, якщо email порожній або відсутній */
  readonly emptyLabel = input<string>('—');

  readonly trimmed = computed(() => {
    const v = this.email();
    return v == null ? '' : String(v).trim();
  });

  /** Для копіювання / показу в статус-рядку браузера */
  readonly mailHref = computed(() => {
    const t = this.trimmed();
    return t ? `mailto:${t}` : '';
  });

  onMailClick(event: MouseEvent): void {
    if (event.button !== 0) return;
    const t = this.trimmed();
    if (!t) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(`mailto:${t}`);
  }
}
