import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../../../core/services/auth.service';
import { HomeworkFileService } from '../../../../core/services/homework-file.service';
import { environment } from '../../../../../environments/environment';

import { StudentHomeworkService } from '../../services/student-homework.service';

import { HomeworkSearchFieldComponent } from '../../../../shared/components/homework-search-field/homework-search-field.component';

import type {

  HomeworkSubmission,

  StudentGroupOption,

  TeacherOptionShort,

} from '../../models/student-homework.model';



@Component({

  selector: 'app-student-homework-page',

  standalone: true,

  imports: [CommonModule, FormsModule, HomeworkSearchFieldComponent],

  templateUrl: './student-homework-page.component.html',

})

export class StudentHomeworkPageComponent implements OnInit {

  private readonly auth = inject(AuthService);

  private readonly api = inject(StudentHomeworkService);

  private readonly files = inject(HomeworkFileService);



  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  @ViewChild('supplementFileInput') supplementFileInput?: ElementRef<HTMLInputElement>;



  loading = true;

  submitting = false;

  loadError: string | null = null;

  /** Set when the groups API fails (distinct from empty enrollments). */
  groupsLoadError: string | null = null;

  submitError: string | null = null;



  teachers: TeacherOptionShort[] = [];

  /** Групи учня з БД (зачислення в school_group_students), не через вибір учителя. */

  groups: StudentGroupOption[] = [];

  submissions: HomeworkSubmission[] = [];

  /** Клієнтська пагінація таблиці «My submissions». */
  readonly submissionsPageSize = 10;

  submissionsPageIndex = 0;

  submissionsSearchQuery = '';



  teacherId = '';

  groupId = '';

  subjectTitle = '';

  /** Предмети обраного вчителя (GET /teacher-subjects). */
  subjectOptions: string[] = [];

  loadingSubjects = false;

  subjectLoadError: string | null = null;

  messageText = '';

  /** Номер домашнього завдання / вправи (окремо від повідомлення). */
  homeworkNumber = '';

  selectedFile: File | null = null;

  /** Модалка «додати ще» для здачі зі статусом submitted. */
  supplementSubmission: HomeworkSubmission | null = null;

  supplementMessage = '';

  supplementSelectedFile: File | null = null;

  supplementBusy = false;

  supplementError: string | null = null;



  ngOnInit(): void {

    const u = this.auth.currentUser();

    if (!u?.id) {

      this.loading = false;

      this.loadError = 'Not signed in.';

      return;

    }

    this.api.listTeachers(u.id).subscribe({

      next: (t) => {

        this.teachers = t;

        this.loading = false;

      },

      error: (err: unknown) => {
        this.loading = false;
        this.loadError = this.describeTeachersLoadError(err);
      },

    });

    this.api.listGroups(u.id).subscribe({

      next: (g) => {

        this.groups = g;

        if (g.length === 1) {

          this.groupId = g[0].id;

        }

      },

      error: () => {

        this.groupsLoadError =

          'Could not load your class groups. Refresh the page or try again later.';

      },

    });

    this.refreshSubmissions(u.id);

  }



  onTeacherChange(): void {
    this.subjectTitle = '';
    this.subjectOptions = [];
    this.subjectLoadError = null;
    const tid = this.teacherId?.trim();
    if (!tid) {
      return;
    }
    const u = this.auth.currentUser();
    if (!u?.id) {
      return;
    }
    this.loadingSubjects = true;
    this.api.listTeacherSubjects(u.id, tid).subscribe({
      next: (titles) => {
        this.subjectOptions = titles ?? [];
        this.loadingSubjects = false;
      },
      error: () => {
        this.loadingSubjects = false;
        this.subjectOptions = [];
        this.subjectLoadError =
          'Could not load subjects for this teacher. Check the connection and try again.';
      },
    });
  }

  triggerFilePicker(): void {

    this.fileInput?.nativeElement.click();

  }



  onFileChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    const f = input.files?.[0];

    this.selectedFile = f ?? null;

    if (f) {

      this.performSubmit(true);

    }

  }



  sendWithoutFile(): void {

    if (this.fileInput?.nativeElement) {

      this.fileInput.nativeElement.value = '';

    }

    this.selectedFile = null;

    this.performSubmit(false);

  }



  refreshSubmissions(userId: string): void {

    this.api.listSubmissions(userId).subscribe({

      next: (s) => {

        this.submissions = s;

        this.clampSubmissionsPage();

      },

      error: () => {

        /* ignore */

      },

    });

  }

  /** Фільтр по полю пошуку (предмет, група, файл, статус, номер ДЗ, відгук тощо). */
  get filteredSubmissions(): HomeworkSubmission[] {

    const q = this.submissionsSearchQuery.trim().toLowerCase();

    if (!q) {

      return this.submissions;

    }

    return this.submissions.filter((s) => this.submissionMatchesQuery(s, q));

  }

  /** Рядки поточної сторінки (не більше {@link submissionsPageSize}). */
  get pagedSubmissions(): HomeworkSubmission[] {

    const list = this.filteredSubmissions;

    const start = this.submissionsPageIndex * this.submissionsPageSize;

    return list.slice(start, start + this.submissionsPageSize);

  }

  get submissionsTotalPages(): number {

    const n = this.filteredSubmissions.length;

    if (n === 0) {

      return 0;

    }

    return Math.ceil(n / this.submissionsPageSize);

  }

  get submissionsRangeStart(): number {

    const n = this.filteredSubmissions.length;

    if (n === 0) {

      return 0;

    }

    return this.submissionsPageIndex * this.submissionsPageSize + 1;

  }

  get submissionsRangeEnd(): number {

    const n = this.filteredSubmissions.length;

    return Math.min(n, (this.submissionsPageIndex + 1) * this.submissionsPageSize);

  }

  onSubmissionsSearchChange(): void {

    this.submissionsPageIndex = 0;

    this.clampSubmissionsPage();

  }

  private submissionMatchesQuery(s: HomeworkSubmission, q: string): boolean {

    const parts: (string | null | undefined)[] = [
      s.subjectTitle,
      s.homeworkNumber,
      s.supplementaryFileName,
      s.fileName,
      s.groupName,
      s.status,
      s.teacherFeedback,
      s.messageText,
      s.stars != null ? String(s.stars) : '',
    ];

    return parts.some((p) => p && String(p).toLowerCase().includes(q));

  }

  prevSubmissionsPage(): void {

    if (this.submissionsPageIndex > 0) {

      this.submissionsPageIndex--;

    }

  }

  nextSubmissionsPage(): void {

    if (this.submissionsPageIndex < this.submissionsTotalPages - 1) {

      this.submissionsPageIndex++;

    }

  }

  private clampSubmissionsPage(): void {

    const totalPages = this.submissionsTotalPages;

    if (totalPages === 0) {

      this.submissionsPageIndex = 0;

      return;

    }

    if (this.submissionsPageIndex >= totalPages) {

      this.submissionsPageIndex = totalPages - 1;

    }

  }



  /** Як після першого завантаження: учитель скидається; група — з БД-зачислень. */

  private resetFormToInitialState(): void {

    this.teacherId = '';

    this.subjectTitle = '';

    this.subjectOptions = [];

    this.subjectLoadError = null;

    this.messageText = '';

    this.homeworkNumber = '';

    this.selectedFile = null;

    this.submitError = null;

    if (this.fileInput?.nativeElement) {

      this.fileInput.nativeElement.value = '';

    }

    if (this.groups.length === 1) {

      this.groupId = this.groups[0].id;

    } else {

      this.groupId = '';

    }

  }



  private performSubmit(withFile: boolean): void {

    this.submitError = null;

    const u = this.auth.currentUser();

    if (!u?.id) {

      this.submitError = 'Not signed in.';

      return;

    }

    if (!this.teacherId.trim()) {

      this.submitError = 'Choose a teacher.';

      return;

    }

    if (this.loadingSubjects) {
      this.submitError = 'Wait until subjects are loaded.';
      return;
    }

    if (!this.subjectTitle.trim()) {

      this.submitError =
        this.subjectOptions.length > 0
          ? 'Select a subject.'
          : 'Enter the subject.';

      return;

    }

    if (withFile && !this.selectedFile) {

      this.submitError = 'No file selected.';

      return;

    }

    if (this.groups.length === 0) {

      this.submitError =

        'You are not enrolled in any class group. Ask your school administrator to add you under Groups in the school admin panel.';

      return;

    }

    if (this.groups.length > 1 && !this.groupId.trim()) {

      this.submitError = 'Select a group — you are enrolled in several groups.';

      return;

    }



    this.submitting = true;

    this.api

      .submit({

        userId: u.id,

        teacherId: this.teacherId.trim(),

        groupId: this.groupId.trim() || undefined,

        subjectTitle: this.subjectTitle.trim(),

        messageText: this.messageText.trim() || undefined,

        homeworkNumber: this.homeworkNumber.trim() || undefined,

        file: withFile && this.selectedFile ? this.selectedFile : undefined,

      })

      .subscribe({

        next: () => {

          this.submitting = false;

          this.submissionsPageIndex = 0;

          this.resetFormToInitialState();

          this.refreshSubmissions(u.id);

        },

        error: (err: HttpErrorResponse) => {

          this.submitting = false;

          const body = err.error;

          let msg = '';

          if (typeof body === 'object' && body) {

            const o = body as { message?: string; detail?: string };

            msg = String(o.message ?? o.detail ?? '');

          }

          this.submitError =

            msg ||

            (err.status === 400 ? 'Check the form and try again.' : 'Upload failed.');

        },

      });

  }



  formatWhen(iso: string | null): string {

    if (!iso) return '—';

    const d = new Date(iso);

    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();

  }

  /** Ім’я файлу для таблиці: placeholder без відправки — як «без файлу». */
  formatFileName(fileName: string): string {
    const t = (fileName ?? '').trim();
    if (
      t === '__no_hw_attachment__.txt' ||
      t === 'no-attachment.txt' ||
      t === '(no file)'
    ) {
      return '(no file)';
    }
    return t || '—';
  }

  hasAttachmentRow(s: HomeworkSubmission): boolean {
    const t = (s.fileName ?? '').trim();
    if (!t || t === '(no file)') return false;
    if (t === '__no_hw_attachment__.txt' || t === 'no-attachment.txt') return false;
    return true;
  }

  hasSupplementaryFile(s: HomeworkSubmission): boolean {
    return !!(s.supplementaryFileName && String(s.supplementaryFileName).trim());
  }

  openSupplementDialog(s: HomeworkSubmission): void {
    this.supplementSubmission = s;
    this.supplementMessage = '';
    this.supplementSelectedFile = null;
    this.supplementError = null;
    if (this.supplementFileInput?.nativeElement) {
      this.supplementFileInput.nativeElement.value = '';
    }
  }

  closeSupplementDialog(): void {
    this.supplementSubmission = null;
    this.supplementMessage = '';
    this.supplementSelectedFile = null;
    this.supplementError = null;
    this.supplementBusy = false;
    if (this.supplementFileInput?.nativeElement) {
      this.supplementFileInput.nativeElement.value = '';
    }
  }

  triggerSupplementFilePicker(): void {
    this.supplementFileInput?.nativeElement.click();
  }

  onSupplementFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.supplementSelectedFile = input.files?.[0] ?? null;
  }

  submitSupplement(): void {
    const u = this.auth.currentUser();
    const sub = this.supplementSubmission;
    if (!u?.id || !sub) {
      return;
    }
    const msg = this.supplementMessage.trim();
    const file = this.supplementSelectedFile;
    if (!msg && !file) {
      this.supplementError = 'Add a note or choose a file.';
      return;
    }
    this.supplementBusy = true;
    this.supplementError = null;
    this.api
      .supplement({
        userId: u.id,
        submissionId: sub.id,
        extraMessage: msg || undefined,
        file: file ?? undefined,
      })
      .subscribe({
        next: () => {
          this.supplementBusy = false;
          this.closeSupplementDialog();
          this.refreshSubmissions(u.id);
        },
        error: (err: HttpErrorResponse) => {
          this.supplementBusy = false;
          const body = err.error;
          let m = '';
          if (typeof body === 'object' && body) {
            m = String((body as { message?: string }).message ?? '');
          }
          this.supplementError = m || 'Could not save.';
        },
      });
  }

  downloadOwnFile(s: HomeworkSubmission): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    this.files.downloadStudentOwnFile(u.id, s.id, 'primary').subscribe({
      next: (blob) => {
        this.files.triggerDownload(blob, s.fileName || 'homework');
      },
      error: () => {
        window.alert('Could not download file.');
      },
    });
  }

  downloadSupplementaryFile(s: HomeworkSubmission): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    const name = (s.supplementaryFileName ?? '').trim() || 'extra';
    this.files.downloadStudentOwnFile(u.id, s.id, 'supplementary').subscribe({
      next: (blob) => {
        this.files.triggerDownload(blob, name);
      },
      error: () => {
        window.alert('Could not download extra file.');
      },
    });
  }

  private describeTeachersLoadError(err: unknown): string {
    if (!err || typeof err !== 'object') {
      return 'Could not load teachers.';
    }
    const e = err as HttpErrorResponse;
    if (e.status === 404) {
      return 'Student profile is not linked to this account. Ask your school administrator.';
    }
    if (e.status === 0) {
      return (
        'Cannot reach the homework API (network error). Check that the backend is running and ' +
        'NG_APP_API_URL points to your Spring API (e.g. https://…/api).'
      );
    }
    if (e.status === 401) {
      return 'Session expired. Log in again.';
    }
    if (e.status === 503 || e.status === 502) {
      return 'The homework service is temporarily unavailable. Try again later.';
    }
    const body = e.error;
    let serverMsg = '';
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string' && m.trim()) {
        serverMsg = m.trim();
      }
    }
    if (serverMsg) {
      return `Could not load teachers: ${serverMsg}`;
    }
    if (e.status >= 500) {
      return 'Could not load teachers (server error). Check backend logs.';
    }
    return `Could not load teachers (HTTP ${e.status}). API base: ${environment.apiUrl}`;
  }
}

