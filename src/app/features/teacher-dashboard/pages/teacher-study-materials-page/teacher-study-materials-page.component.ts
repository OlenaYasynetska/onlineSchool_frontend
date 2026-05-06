import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { concat } from 'rxjs';
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
  /** PDF-файли, додаються до набору одразу після створення (один або кілька). */
  createPdfFiles: File[] = [];
  createBusy = false;
  createError: string | null = null;

  addLessonOpen = false;
  lessonTitle = '';
  /** Один файл (зворотна сумісність) або кілька — через multiple input. */
  lessonFiles: File[] = [];
  uploadBusy = false;
  uploadError: string | null = null;

  pdfTitle = '';
  safePdfUrl: SafeResourceUrl | null = null;

  editSetOpen = false;
  editSetTitle = '';
  editSetDescription = '';
  editingSetId: string | null = null;
  editSetBusy = false;

  editLessonOpen = false;
  editLessonTitle = '';
  editingLessonId: string | null = null;
  editLessonBusy = false;

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
    this.newDescription = '';
    this.newSubjectId = this.subjects[0]?.id ?? '';
    this.newTitle = this.newSubjectId
      ? this.suggestedSetTitleForSubjectId(this.newSubjectId)
      : '';
    this.createPdfFiles = [];
    this.createError = null;
  }

  closeCreate(): void {
    if (this.createBusy) {
      return;
    }
    this.createOpen = false;
    this.createPdfFiles = [];
    this.createError = null;
  }

  onCreatePdfFilesChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.createPdfFiles = this.collectPdfFilesFromInput(input);
    if (input.files && input.files.length > 0 && this.createPdfFiles.length === 0) {
      this.createError = 'Only PDF files are accepted.';
    } else {
      this.createError = null;
    }
  }

  removeCreatePdfAt(index: number): void {
    this.createPdfFiles = this.createPdfFiles.filter((_, i) => i !== index);
  }

  onCreateSubjectSelected(): void {
    if (!this.newTitle.trim()) {
      this.newTitle = this.suggestedSetTitleForSubjectId(this.newSubjectId);
    }
  }

  submitCreate(): void {
    const u = this.auth.currentUser();
    const title = this.resolveCreateTitle().trim();
    if (!u?.id || !this.newSubjectId || !title || this.createBusy) {
      return;
    }
    this.createBusy = true;
    this.createError = null;
    this.api
      .createTeacherSet(u.id, {
        title,
        description: this.newDescription.trim() || null,
        teacherSubjectId: this.newSubjectId,
      })
      .subscribe({
        next: (created) => {
          const files = [...this.createPdfFiles];
          if (files.length === 0) {
            this.createBusy = false;
            this.closeCreate();
            this.reload();
            queueMicrotask(() => this.selectSet(created));
            return;
          }
          const uploads = files.map((file) =>
            this.api.uploadTeacherLessonPdf(
              u.id,
              created.id,
              this.lessonTitleFromFileName(file.name),
              file
            )
          );
          concat(...uploads).subscribe({
            complete: () => {
              this.createBusy = false;
              this.closeCreate();
              this.reload();
              queueMicrotask(() => this.selectSet(created));
            },
            error: (err: { error?: { message?: string } | string; message?: string }) => {
              this.createBusy = false;
              const msg =
                (typeof err?.error === 'object' && err?.error?.message) ||
                (typeof err?.error === 'string' ? err.error : null) ||
                err?.message ||
                'Upload failed';
              window.alert(
                `Set was created, but uploading PDFs failed: ${msg}\nYou can add files with “Add PDF lesson”.`
              );
              this.createOpen = false;
              this.createPdfFiles = [];
              this.createError = null;
              this.reload();
              queueMicrotask(() => this.selectSet(created));
            },
          });
        },
        error: (err: { error?: { message?: string }; message?: string }) => {
          this.createBusy = false;
          window.alert(
            `Could not create set: ${err?.error?.message ?? err?.message ?? 'error'}`
          );
        },
      });
  }

  openAddLesson(): void {
    this.addLessonOpen = true;
    this.lessonTitle = '';
    this.lessonFiles = [];
    this.uploadError = null;
  }

  closeAddLesson(): void {
    if (this.uploadBusy) {
      return;
    }
    this.addLessonOpen = false;
    this.lessonFiles = [];
  }

  onLessonFilesChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.lessonFiles = this.collectPdfFilesFromInput(input);
    if (input.files && input.files.length > 0 && this.lessonFiles.length === 0) {
      this.uploadError = 'Only PDF files are accepted.';
    } else {
      this.uploadError = null;
    }
  }

  removeLessonFileAt(index: number): void {
    this.lessonFiles = this.lessonFiles.filter((_, i) => i !== index);
  }

  submitLesson(): void {
    const u = this.auth.currentUser();
    const setId = this.selectedSet?.id;
    const files = [...this.lessonFiles];
    if (!u?.id || !setId) {
      this.uploadError = 'Missing set or user.';
      return;
    }
    if (files.length === 0) {
      this.uploadError = 'Choose at least one PDF file.';
      return;
    }
    const baseTitle = this.lessonTitle.trim();
    this.uploadBusy = true;
    this.uploadError = null;

    const uploads = files.map((file, i) => {
      const title =
        files.length === 1 && baseTitle
          ? baseTitle
          : baseTitle
            ? `${baseTitle} (${i + 1})`
            : this.lessonTitleFromFileName(file.name);
      return this.api.uploadTeacherLessonPdf(u.id, setId, title, file);
    });

    concat(...uploads).subscribe({
      complete: () => {
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

  private suggestedSetTitleForSubjectId(subjectId: string): string {
    const sub = this.subjects.find((s) => s.id === subjectId);
    const name = sub?.title?.trim();
    return name ? `${name} — materials` : 'Study materials';
  }

  /** Заголовок набору: поле Title, або перший PDF, або «Предмет — materials». */
  private resolveCreateTitle(): string {
    const manual = this.newTitle.trim();
    if (manual) {
      return manual;
    }
    if (this.createPdfFiles.length > 0) {
      return this.lessonTitleFromFileName(this.createPdfFiles[0].name);
    }
    return this.suggestedSetTitleForSubjectId(this.newSubjectId);
  }

  private lessonTitleFromFileName(name: string): string {
    const n = name.trim();
    if (!n) {
      return 'Lesson';
    }
    const lower = n.toLowerCase();
    if (lower.endsWith('.pdf')) {
      const t = n.slice(0, -4).trim();
      return t || 'Lesson';
    }
    return n;
  }

  private isPdfFile(file: File): boolean {
    const ct = (file.type || '').toLowerCase();
    if (ct.includes('pdf')) {
      return true;
    }
    return file.name.toLowerCase().endsWith('.pdf');
  }

  /** Щонайбільше 30 файлів за один раз (захист від випадково великого вибору). */
  private collectPdfFilesFromInput(input: HTMLInputElement): File[] {
    const list = input.files;
    const out: File[] = [];
    if (!list?.length) {
      return out;
    }
    const max = Math.min(list.length, 30);
    for (let i = 0; i < max; i++) {
      const f = list.item(i);
      if (f && this.isPdfFile(f)) {
        out.push(f);
      }
    }
    return out;
  }

  openEditSet(row: StudyMaterialSetDto, ev?: Event): void {
    ev?.stopPropagation?.();
    this.editingSetId = row.id;
    this.editSetTitle = row.title;
    this.editSetDescription = row.description ?? '';
    this.editSetOpen = true;
  }

  closeEditSet(): void {
    if (this.editSetBusy) {
      return;
    }
    this.editSetOpen = false;
    this.editingSetId = null;
  }

  submitEditSet(): void {
    const u = this.auth.currentUser();
    const id = this.editingSetId;
    const title = this.editSetTitle.trim();
    if (!u?.id || !id || !title || this.editSetBusy) {
      return;
    }
    this.editSetBusy = true;
    this.api
      .patchTeacherSet(u.id, id, {
        title,
        description: this.editSetDescription.trim() || null,
      })
      .subscribe({
        next: (updated) => {
          this.editSetBusy = false;
          this.closeEditSet();
          if (this.selectedSet?.id === updated.id) {
            this.selectedSet = updated;
          }
          this.reload();
        },
        error: () => {
          this.editSetBusy = false;
          window.alert('Could not update set.');
        },
      });
  }

  confirmDeleteSet(row: StudyMaterialSetDto, ev?: Event): void {
    ev?.stopPropagation?.();
    if (
      !window.confirm(
        `Delete “${row.title}” and all ${row.lessonCount} lesson(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.api.deleteTeacherSet(u.id, row.id).subscribe({
      next: () => {
        if (this.selectedSet?.id === row.id) {
          this.selectedSet = null;
          this.lessons = [];
        }
        this.reload();
      },
      error: () => window.alert('Could not delete set.'),
    });
  }

  openEditLesson(lesson: StudyMaterialLessonDto): void {
    this.editingLessonId = lesson.id;
    this.editLessonTitle = lesson.title;
    this.editLessonOpen = true;
  }

  closeEditLesson(): void {
    if (this.editLessonBusy) {
      return;
    }
    this.editLessonOpen = false;
    this.editingLessonId = null;
  }

  submitEditLesson(): void {
    const u = this.auth.currentUser();
    const id = this.editingLessonId;
    const title = this.editLessonTitle.trim();
    if (!u?.id || !id || !title || this.editLessonBusy) {
      return;
    }
    this.editLessonBusy = true;
    this.api.patchTeacherLesson(u.id, id, { title }).subscribe({
      next: () => {
        this.editLessonBusy = false;
        this.closeEditLesson();
        const sel = this.selectedSet;
        this.reload();
        if (sel) {
          queueMicrotask(() => this.selectSet(sel));
        }
      },
      error: () => {
        this.editLessonBusy = false;
        window.alert('Could not update lesson.');
      },
    });
  }

  confirmDeleteLesson(lesson: StudyMaterialLessonDto): void {
    if (!window.confirm(`Delete lesson “${lesson.title}”?`)) {
      return;
    }
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.api.deleteTeacherLesson(u.id, lesson.id).subscribe({
      next: () => {
        const sel = this.selectedSet;
        this.reload();
        if (sel) {
          queueMicrotask(() => this.selectSet(sel));
        }
      },
      error: () => window.alert('Could not delete lesson.'),
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
