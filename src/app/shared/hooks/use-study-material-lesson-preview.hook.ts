import type { Observable } from 'rxjs';
import type { StudyMaterialLessonDto } from '../../core/services/study-materials.service';
import { normalizeIssuuEmbedUrl } from '../utils/issuu-embed-url.util';

export function sanitizeLessonPdfDownloadFileName(title: string): string {
  const base = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
  return `${base || 'lesson'}.pdf`;
}

/** Стан та дії попереднього перегляду PDF / Issuu у картці «Study materials». */
export interface StudyMaterialLessonPreview {
  pdfTitle: string;
  pdfBlob: Blob | null;
  pdfDownloadName: string;
  issuuReaderEmbedUrl: string | null;
  pdfFullscreen: boolean;
  closePdf(): void;
  togglePdfFullscreen(): void;
  minimizePdfFullscreen(): void;
  openIssuuReader(lesson: StudyMaterialLessonDto): void;
  openPdf(lesson: StudyMaterialLessonDto): void;
}

export interface UseStudyMaterialLessonPreviewOptions {
  fetchPdfBlob: (lesson: StudyMaterialLessonDto) => Observable<Blob> | null;
  /** Якщо normalize Issuu дав порожній URL (наприклад вчитель без налаштованого посилання). */
  onInvalidIssuuEmbed?: () => void;
  onPdfHttpError?: () => void;
}

/**
 * Спільна логіка відкриття PDF та Issuu (картка + fullscreen), для учня / учителя / адміна школи.
 */
export function useStudyMaterialLessonPreview(
  opts: UseStudyMaterialLessonPreviewOptions,
): StudyMaterialLessonPreview {
  const preview: StudyMaterialLessonPreview = {
    pdfTitle: '',
    pdfBlob: null,
    pdfDownloadName: 'lesson.pdf',
    issuuReaderEmbedUrl: null,
    pdfFullscreen: false,

    closePdf(): void {
      preview.pdfBlob = null;
      preview.issuuReaderEmbedUrl = null;
      preview.pdfTitle = '';
      preview.pdfFullscreen = false;
    },

    togglePdfFullscreen(): void {
      preview.pdfFullscreen = !preview.pdfFullscreen;
    },

    minimizePdfFullscreen(): void {
      preview.pdfFullscreen = false;
    },

    openIssuuReader(lesson: StudyMaterialLessonDto): void {
      const n = normalizeIssuuEmbedUrl(lesson.issuuEmbedUrl);
      if (!n) {
        opts.onInvalidIssuuEmbed?.();
        return;
      }
      preview.pdfBlob = null;
      preview.pdfTitle = lesson.title;
      preview.issuuReaderEmbedUrl = n;
      preview.pdfFullscreen = false;
    },

    openPdf(lesson: StudyMaterialLessonDto): void {
      preview.pdfBlob = null;
      preview.issuuReaderEmbedUrl = null;
      preview.pdfTitle = lesson.title;
      preview.pdfDownloadName = sanitizeLessonPdfDownloadFileName(lesson.title);
      preview.pdfFullscreen = false;
      const obs = opts.fetchPdfBlob(lesson);
      if (!obs) {
        return;
      }
      obs.subscribe({
        next: (blob) => {
          preview.pdfBlob = blob;
        },
        error: () => {
          if (opts.onPdfHttpError) {
            opts.onPdfHttpError();
          } else {
            window.alert('Could not open PDF.');
          }
        },
      });
    },
  };

  return preview;
}
