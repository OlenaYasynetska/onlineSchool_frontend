import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { StudentHomeworkService } from '../../services/student-homework.service';
import type {
  HomeworkSubmission,
  StudentGroupOption,
  TeacherOptionShort,
} from '../../models/student-homework.model';

@Component({
  selector: 'app-student-homework-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-homework-page.component.html',
})
export class StudentHomeworkPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(StudentHomeworkService);

  loading = true;
  submitting = false;
  loadError: string | null = null;
  submitError: string | null = null;

  teachers: TeacherOptionShort[] = [];
  groups: StudentGroupOption[] = [];
  submissions: HomeworkSubmission[] = [];

  teacherId = '';
  groupId = '';
  subjectTitle = '';
  messageText = '';
  selectedFile: File | null = null;

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
      error: (err: { status?: number; error?: unknown }) => {
        this.loading = false;
        this.loadError =
          err?.status === 404
            ? 'Student profile is not linked to this account. Ask your school administrator.'
            : 'Could not load teachers.';
      },
    });
    this.api.listGroups(u.id).subscribe({
      next: (g) => (this.groups = g),
      error: () => {
        /* optional */
      },
    });
    this.refreshSubmissions(u.id);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0];
    this.selectedFile = f ?? null;
  }

  refreshSubmissions(userId: string): void {
    this.api.listSubmissions(userId).subscribe({
      next: (s) => (this.submissions = s),
      error: () => {
        /* ignore */
      },
    });
  }

  submit(): void {
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
    if (!this.subjectTitle.trim()) {
      this.submitError = 'Enter the subject.';
      return;
    }
    if (!this.selectedFile) {
      this.submitError = 'Attach a file (PDF, DOC, etc.).';
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
        file: this.selectedFile,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.subjectTitle = '';
          this.messageText = '';
          this.selectedFile = null;
          this.refreshSubmissions(u.id);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting = false;
          const body = err.error;
          let msg = '';
          if (typeof body === 'object' && body && 'message' in body) {
            msg = String((body as { message?: string }).message);
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
}
