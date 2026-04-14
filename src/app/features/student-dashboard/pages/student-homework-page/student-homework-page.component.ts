import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';

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



  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;



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

      next: (s) => (this.submissions = s),

      error: () => {

        /* ignore */

      },

    });

  }



  /** Як після першого завантаження: учитель скидається; група — з БД-зачислень. */

  private resetFormToInitialState(): void {

    this.teacherId = '';

    this.subjectTitle = '';

    this.messageText = '';

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

    if (!this.subjectTitle.trim()) {

      this.submitError = 'Enter the subject.';

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

        file: withFile && this.selectedFile ? this.selectedFile : undefined,

      })

      .subscribe({

        next: () => {

          this.submitting = false;

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

}

