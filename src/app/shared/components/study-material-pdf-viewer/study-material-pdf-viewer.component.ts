import { Component, Input } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

/**
 * Flipbook-style PDF reading (PDF.js book mode + dark chrome), similar to embedded Issuu-style viewers.
 */
@Component({
  selector: 'app-study-material-pdf-viewer',
  standalone: true,
  imports: [NgxExtendedPdfViewerModule],
  templateUrl: './study-material-pdf-viewer.component.html',
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
export class StudyMaterialPdfViewerComponent {
  @Input() pdfSrc: Blob | null = null;
  @Input() allowDownload = false;
  @Input() downloadFileName = 'lesson.pdf';
}
