import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { normalizeIssuuEmbedUrl } from '../../utils/issuu-embed-url.util';

@Component({
  selector: 'app-issuu-embed-frame',
  standalone: true,
  templateUrl: './issuu-embed-frame.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
      }
    `,
  ],
})
export class IssuuEmbedFrameComponent {
  private readonly sanitizer = inject(DomSanitizer);

  trustedUrl: SafeResourceUrl | null = null;

  @Input() set embedUrl(value: string | null | undefined) {
    const normalized = normalizeIssuuEmbedUrl(value);
    this.trustedUrl = normalized
      ? this.sanitizer.bypassSecurityTrustResourceUrl(normalized)
      : null;
  }
}
