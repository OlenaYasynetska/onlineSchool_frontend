import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { HomeworkFileService } from '../../../../core/services/homework-file.service';
import { TeacherHomeworkService } from '../../services/teacher-homework.service';
import type { HomeworkSubmission } from '../../../student-dashboard/models/student-homework.model';
import { HomeworkSearchFieldComponent } from '../../../../shared/components/homework-search-field/homework-search-field.component';

@Component({
  selector: 'app-teacher-homework-page',
  standalone: true,
  imports: [CommonModule, FormsModule, HomeworkSearchFieldComponent],
  templateUrl: './teacher-homework-page.component.html',
})
export class TeacherHomeworkPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherHomeworkService);
  private readonly files = inject(HomeworkFileService);

  loading = true;
  noProfile = false;
  pending: HomeworkSubmission[] = [];
  graded: HomeworkSubmission[] = [];

  /** Фільтр для обох таблиць (учень, група, предмет, файл, повідомлення…). */
  inboxSearchQuery = '';

  /** Запись, для которой открыта оценка (звёзды + отзыв). */
  gradingSubmission: HomeworkSubmission | null = null;
  gradeStars = 2;
  gradeFeedback = '';
  gradeError: string | null = null;
  gradingBusy = false;

  readonly starChoices = [1, 2, 3] as const;

  ngOnInit(): void {
    const u = this.auth.currentUser();
    if (!u?.id) {
      this.loading = false;
      return;
    }
    this.reload(u.id);
  }

  reload(userId: string): void {
    this.loading = true;
    this.noProfile = false;
    this.api.listPending(userId).subscribe({
      next: (p) => {
        this.pending = p;
        this.api.listGraded(userId).subscribe({
          next: (g) => {
            this.graded = g;
            this.loading = false;
          },
          error: () => {
            this.graded = [];
            this.loading = false;
          },
        });
      },
      error: (err: { status?: number }) => {
        this.loading = false;
        this.pending = [];
        this.graded = [];
        if (err?.status === 404) {
          this.noProfile = true;
        }
      },
    });
  }

  openGrade(sub: HomeworkSubmission): void {
    this.gradingSubmission = sub;
    this.gradeStars = 2;
    this.gradeFeedback = '';
    this.gradeError = null;
  }

  closeGrade(): void {
    this.gradingSubmission = null;
    this.gradeError = null;
  }

  submitGrade(): void {
    const u = this.auth.currentUser();
    const sub = this.gradingSubmission;
    if (!u?.id || !sub) return;
    this.gradeError = null;
    this.gradingBusy = true;
    this.api
      .grade(u.id, sub.id, {
        stars: this.gradeStars,
        feedback: this.gradeFeedback.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.gradingBusy = false;
          this.closeGrade();
          this.reload(u.id);
        },
        error: (err: HttpErrorResponse) => {
          this.gradingBusy = false;
          const body = err.error;
          let msg = '';
          if (typeof body === 'string') {
            msg = body;
          } else if (body && typeof body === 'object' && 'message' in body) {
            msg = String((body as { message?: string }).message);
          }
          this.gradeError = msg || err.message || 'Не удалось сохранить оценку.';
        },
      });
  }

  /** Є реальне вкладення (не «без файлу»). */
  hasAttachment(sub: HomeworkSubmission): boolean {
    const t = (sub.fileName ?? '').trim();
    if (!t || t === '(no file)') return false;
    if (t === '__no_hw_attachment__.txt' || t === 'no-attachment.txt') return false;
    return true;
  }

  download(sub: HomeworkSubmission): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    this.files.downloadTeacherFile(u.id, sub.id, 'primary').subscribe({
      next: (blob) =>
        this.files.triggerDownload(blob, sub.fileName || 'homework'),
      error: () => {
        window.alert('Could not download file.');
      },
    });
  }

  downloadSupplementary(sub: HomeworkSubmission): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    const name = (sub.supplementaryFileName ?? '').trim() || 'extra';
    this.files.downloadTeacherFile(u.id, sub.id, 'supplementary').subscribe({
      next: (blob) => this.files.triggerDownload(blob, name),
      error: () => {
        window.alert('Could not download extra file.');
      },
    });
  }

  hasSupplementaryFile(sub: HomeworkSubmission): boolean {
    return !!(sub.supplementaryFileName && String(sub.supplementaryFileName).trim());
  }

  formatWhen(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }

  get filteredPending(): HomeworkSubmission[] {
    const q = this.inboxSearchQuery.trim().toLowerCase();
    if (!q) {
      return this.pending;
    }
    return this.pending.filter((s) => this.inboxRowMatches(s, q));
  }

  get filteredGraded(): HomeworkSubmission[] {
    const q = this.inboxSearchQuery.trim().toLowerCase();
    if (!q) {
      return this.graded;
    }
    return this.graded.filter((s) => this.inboxRowMatches(s, q));
  }

  private inboxRowMatches(s: HomeworkSubmission, q: string): boolean {
    const parts: (string | null | undefined)[] = [
      s.studentName,
      s.subjectTitle,
      s.groupName,
      s.homeworkNumber,
      s.supplementaryFileName,
      s.fileName,
      s.messageText,
      s.status,
      s.teacherFeedback,
      s.stars != null ? String(s.stars) : '',
    ];
    return parts.some((p) => p && String(p).toLowerCase().includes(q));
  }
}
