import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StudyMaterialsService,
  type StudyMaterialLessonDto,
  type StudyMaterialSetDto,
} from '../../../../core/services/study-materials.service';

@Component({
  selector: 'app-student-study-materials-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-study-materials-page.component.html',
})
export class StudentStudyMaterialsPageComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudyMaterialsService);
  private readonly sanitizer = inject(DomSanitizer);

  private rawPdfObjectUrl: string | null = null;

  loading = true;
  notLinked = false;
  sets: StudyMaterialSetDto[] = [];
  selectedSet: StudyMaterialSetDto | null = null;
  lessons: StudyMaterialLessonDto[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  pdfTitle = '';
  safePdfUrl: SafeResourceUrl | null = null;

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

  ngOnDestroy(): void {
    this.revokePdf();
  }

  private revokePdf(): void {
    if (this.rawPdfObjectUrl) {
      URL.revokeObjectURL(this.rawPdfObjectUrl);
      this.rawPdfObjectUrl = null;
    }
    this.safePdfUrl = null;
  }

  selectSet(row: StudyMaterialSetDto): void {
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

  closePdf(): void {
    this.revokePdf();
    this.pdfTitle = '';
  }

  openPdf(lesson: StudyMaterialLessonDto): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.revokePdf();
    this.pdfTitle = lesson.title;
    this.api.getStudentLessonPdfBlob(u.id, lesson.id, true).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.rawPdfObjectUrl = url;
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: () => window.alert('Could not open PDF.'),
    });
  }
}
