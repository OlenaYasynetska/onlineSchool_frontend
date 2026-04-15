import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HomeworkFileService } from '../../../core/services/homework-file.service';
import type { HomeworkSubmission } from '../../student-dashboard/models/student-homework.model';

export interface GradeHomeworkBody {
  stars: number;
  feedback?: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherHomeworkService {
  private readonly http = inject(HttpClient);
  private readonly files = inject(HomeworkFileService);

  private base(): string {
    return `${environment.apiUrl}/teacher/homework`;
  }

  listPending(userId: string): Observable<HomeworkSubmission[]> {
    return this.http.get<HomeworkSubmission[]>(
      `${this.base()}/pending?userId=${encodeURIComponent(userId)}`
    );
  }

  listGraded(userId: string): Observable<HomeworkSubmission[]> {
    return this.http.get<HomeworkSubmission[]>(
      `${this.base()}/graded?userId=${encodeURIComponent(userId)}`
    );
  }

  grade(
    userId: string,
    submissionId: string,
    body: GradeHomeworkBody
  ): Observable<HomeworkSubmission> {
    return this.http.post<HomeworkSubmission>(
      `${this.base()}/${encodeURIComponent(submissionId)}/grade?userId=${encodeURIComponent(userId)}`,
      body
    );
  }

  /** Binary download (avoids cross-origin window.open issues). */
  downloadFileBlob(userId: string, submissionId: string): Observable<Blob> {
    return this.files.downloadTeacherFile(userId, submissionId);
  }

  previewFileBlob(userId: string, submissionId: string): Observable<Blob> {
    return this.files.previewTeacherFile(userId, submissionId);
  }
}
