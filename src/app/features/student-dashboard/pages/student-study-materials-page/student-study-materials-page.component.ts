import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StudyMaterialsService,
  type StudyMaterialLessonDto,
  type StudyMaterialSetDto,
} from '../../../../core/services/study-materials.service';
import { StudyMaterialPdfViewerComponent } from '../../../../shared/components/study-material-pdf-viewer/study-material-pdf-viewer.component';
import { IssuuEmbedFrameComponent } from '../../../../shared/components/issuu-embed-frame/issuu-embed-frame.component';
import { normalizeIssuuEmbedUrl } from '../../../../shared/utils/issuu-embed-url.util';

@Component({
  selector: 'app-student-study-materials-page',
  standalone: true,
  imports: [CommonModule, StudyMaterialPdfViewerComponent, IssuuEmbedFrameComponent],
  templateUrl: './student-study-materials-page.component.html',
})
export class StudentStudyMaterialsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudyMaterialsService);

  loading = true;
  notLinked = false;
  sets: StudyMaterialSetDto[] = [];
  selectedSet: StudyMaterialSetDto | null = null;
  lessons: StudyMaterialLessonDto[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  pdfTitle = '';
  pdfBlob: Blob | null = null;
  pdfDownloadName = 'lesson.pdf';
  issuuReaderEmbedUrl: string | null = null;
  /** Inline preview in card vs fullscreen overlay. */
  pdfFullscreen = false;

  constructor() {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      this.notLinked = true;
      return;
    }
    this.api.listStudentSets(u.id).subscribe({
      next: (s) => {
        this.sets = s;
        this.loading = false;
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.sets = [];
        if (err?.status === 404) {
          this.notLinked = true;
        }
      },
    });
  }

  selectSet(row: StudyMaterialSetDto): void {
    if (this.selectedSet?.id !== row.id) {
      this.closePdf();
    }
    this.selectedSet = row;
    this.lessons = [];
    this.lessonsError = null;
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.lessonsLoading = true;
    this.api.listStudentLessons(u.id, row.id).subscribe({
      next: (list) => {
        this.lessons = list;
        this.lessonsLoading = false;
      },
      error: () => {
        this.lessons = [];
        this.lessonsLoading = false;
        this.lessonsError = 'Could not load lessons.';
      },
    });
  }

  private sanitizeDownloadFileName(title: string): string {
    const base = title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
      .replace(/\s+/g, ' ')
      .slice(0, 120);
    return `${base || 'lesson'}.pdf`;
  }

  closePdf(): void {
    this.pdfBlob = null;
    this.issuuReaderEmbedUrl = null;
    this.pdfTitle = '';
    this.pdfFullscreen = false;
  }

  togglePdfFullscreen(): void {
    this.pdfFullscreen = !this.pdfFullscreen;
  }

  minimizePdfFullscreen(): void {
    this.pdfFullscreen = false;
  }

  openIssuuReader(lesson: StudyMaterialLessonDto): void {
    const n = normalizeIssuuEmbedUrl(lesson.issuuEmbedUrl);
    if (!n) {
      return;
    }
    this.pdfBlob = null;
    this.pdfTitle = lesson.title;
    this.issuuReaderEmbedUrl = n;
    this.pdfFullscreen = false;
  }

  openPdf(lesson: StudyMaterialLessonDto): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.pdfBlob = null;
    this.issuuReaderEmbedUrl = null;
    this.pdfTitle = lesson.title;
    this.pdfDownloadName = this.sanitizeDownloadFileName(lesson.title);
    this.pdfFullscreen = false;
    this.api.getStudentLessonPdfBlob(u.id, lesson.id, true).subscribe({
      next: (blob) => {
        this.pdfBlob = blob;
      },
      error: () => window.alert('Could not open PDF.'),
    });
  }
}
