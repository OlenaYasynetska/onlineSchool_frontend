import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../../core/services/auth.service';
import {
  StudyMaterialsService,
  type StudyMaterialLessonDto,
  type StudyMaterialSetDto,
  type TeacherSubjectOption,
} from '../../../../core/services/study-materials.service';

@Component({
  selector: 'app-teacher-study-materials-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-study-materials-page.component.html',
})
export class TeacherStudyMaterialsPageComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudyMaterialsService);
  private readonly sanitizer = inject(DomSanitizer);

  private rawPdfObjectUrl: string | null = null;

  loading = true;
  noProfile = false;
  sets: StudyMaterialSetDto[] = [];
  subjects: TeacherSubjectOption[] = [];

  selectedSet: StudyMaterialSetDto | null = null;
  lessons: StudyMaterialLessonDto[] = [];
  lessonsLoading = false;
  lessonsError: string | null = null;

  createOpen = false;
  newTitle = '';
  newDescription = '';
  newSubjectId = '';

  addLessonOpen = false;
  lessonTitle = '';
  lessonFile: File | null = null;
  uploadBusy = false;
  uploadError: string | null = null;

  pdfTitle = '';
  safePdfUrl: SafeResourceUrl | null = null;

  constructor() {
    this.reload();
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

  reload(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.noProfile = false;
    this.api.listTeacherSets(u.id).subscribe({
      next: (sets) => {
        this.sets = sets;
        this.loading = false;
        this.api.listTeacherSubjects(u.id).subscribe({
          next: (s) => (this.subjects = s),
          error: () => (this.subjects = []),
        });
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.sets = [];
        if (err?.status === 404) {
          this.noProfile = true;
        }
      },
    });
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
    this.api.listTeacherLessons(u.id, row.id).subscribe({
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

  openCreate(): void {
    this.createOpen = true;
    this.newTitle = '';
    this.newDescription = '';
    this.newSubjectId = this.subjects[0]?.id ?? '';
  }

  closeCreate(): void {
    this.createOpen = false;
  }

  submitCreate(): void {
    const u = this.auth.currentUser();
    if (!u?.id || !this.newTitle.trim() || !this.newSubjectId) {
      return;
    }
    this.api
      .createTeacherSet(u.id, {
        title: this.newTitle.trim(),
        description: this.newDescription.trim() || null,
        teacherSubjectId: this.newSubjectId,
      })
      .subscribe({
        next: () => {
          this.closeCreate();
          this.reload();
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          window.alert(
            `Could not create set: ${err?.error?.message ?? err?.message ?? 'error'}`
          );
        },
      });
  }

  openAddLesson(): void {
    this.addLessonOpen = true;
    this.lessonTitle = '';
    this.lessonFile = null;
    this.uploadError = null;
  }

  closeAddLesson(): void {
    this.addLessonOpen = false;
  }

  onLessonFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0];
    this.lessonFile = f ?? null;
  }

  submitLesson(): void {
    const u = this.auth.currentUser();
    const setId = this.selectedSet?.id;
    if (!u?.id || !setId || !this.lessonTitle.trim() || !this.lessonFile) {
      this.uploadError = 'Title and PDF file are required.';
      return;
    }
    this.uploadBusy = true;
    this.uploadError = null;
    this.api.uploadTeacherLessonPdf(u.id, setId, this.lessonTitle.trim(), this.lessonFile).subscribe({
      next: () => {
        this.uploadBusy = false;
        const sel = this.selectedSet;
        this.closeAddLesson();
        if (sel) {
          this.selectSet(sel);
        }
        this.reload();
     },
      error: (err: { error?: { message?: string } | string; message?: string }) => {
        this.uploadBusy = false;
        this.uploadError =
          (typeof err?.error === 'object' && err?.error?.message) ||
          (typeof err?.error === 'string' ? err.error : null) ||
          err?.message ||
          'Upload failed';
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
    this.api.getTeacherLessonPdfBlob(u.id, lesson.id, true).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.rawPdfObjectUrl = url;
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },
      error: () => window.alert('Could not open PDF.'),
    });
  }
}
