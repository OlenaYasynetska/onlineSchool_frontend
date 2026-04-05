import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { TeacherHomeworkService } from '../../services/teacher-homework.service';
import type { HomeworkSubmission } from '../../../student-dashboard/models/student-homework.model';

@Component({
  selector: 'app-teacher-homework-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-homework-page.component.html',
})
export class TeacherHomeworkPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(TeacherHomeworkService);

  loading = true;
  noProfile = false;
  pending: HomeworkSubmission[] = [];
  graded: HomeworkSubmission[] = [];

  /** Row opened for grading */
  gradingId: string | null = null;
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
    this.gradingId = sub.id;
    this.gradeStars = 2;
    this.gradeFeedback = '';
    this.gradeError = null;
  }

  closeGrade(): void {
    this.gradingId = null;
    this.gradeError = null;
  }

  submitGrade(): void {
    const u = this.auth.currentUser();
    const id = this.gradingId;
    if (!u?.id || !id) return;
    this.gradeError = null;
    this.gradingBusy = true;
    this.api
      .grade(u.id, id, {
        stars: this.gradeStars,
        feedback: this.gradeFeedback.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.gradingBusy = false;
          this.closeGrade();
          this.reload(u.id);
        },
        error: () => {
          this.gradingBusy = false;
          this.gradeError = 'Could not save grade.';
        },
      });
  }

  download(sub: HomeworkSubmission): void {
    const u = this.auth.currentUser();
    if (!u?.id) return;
    this.api.downloadFileBlob(u.id, sub.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sub.fileName || 'homework';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        window.alert('Could not download file.');
      },
    });
  }

  formatWhen(iso: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  }
}
