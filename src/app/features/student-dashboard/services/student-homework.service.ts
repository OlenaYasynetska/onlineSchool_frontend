import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  HomeworkSubmission,
  StudentDashboardContextDto,
  StudentGroupOption,
  StudentMyStarsDto,
  TeacherOptionShort,
} from '../models/student-homework.model';

@Injectable({ providedIn: 'root' })
export class StudentHomeworkService {
  constructor(private readonly http: HttpClient) {}

  private base(): string {
    return `${environment.apiUrl}/student/homework`;
  }

  listTeachers(userId: string): Observable<TeacherOptionShort[]> {
    return this.http.get<TeacherOptionShort[]>(
      `${this.base()}/teachers?userId=${encodeURIComponent(userId)}`
    );
  }

  listGroups(userId: string): Observable<StudentGroupOption[]> {
    return this.http.get<StudentGroupOption[]>(
      `${this.base()}/groups?userId=${encodeURIComponent(userId)}`
    );
  }

  listSubmissions(userId: string): Observable<HomeworkSubmission[]> {
    return this.http.get<HomeworkSubmission[]>(
      `${this.base()}/submissions?userId=${encodeURIComponent(userId)}`
    );
  }

  myStars(userId: string): Observable<StudentMyStarsDto> {
    return this.http.get<StudentMyStarsDto>(
      `${this.base()}/my-stars?userId=${encodeURIComponent(userId)}`
    );
  }

  dashboardContext(userId: string): Observable<StudentDashboardContextDto> {
    return this.http.get<StudentDashboardContextDto>(
      `${this.base()}/dashboard-context?userId=${encodeURIComponent(userId)}`
    );
  }

  submit(params: {
    userId: string;
    teacherId: string;
    groupId?: string;
    subjectTitle: string;
    messageText?: string;
    file?: File;
  }): Observable<HomeworkSubmission> {
    const fd = new FormData();
    fd.append('userId', params.userId);
    fd.append('teacherId', params.teacherId);
    fd.append('subjectTitle', params.subjectTitle);
    if (params.groupId?.trim()) {
      fd.append('groupId', params.groupId.trim());
    }
    if (params.messageText?.trim()) {
      fd.append('messageText', params.messageText.trim());
    }
    if (params.file) {
      fd.append('file', params.file, params.file.name);
    } else {
      // Always send a non-empty "file" part: empty blobs may be dropped or rejected; backend
      // recognizes __no_hw_attachment__.txt as «no real file».
      fd.append(
        'file',
        new Blob([new Uint8Array([0])]),
        '__no_hw_attachment__.txt',
      );
    }
    return this.http.post<HomeworkSubmission>(`${this.base()}/submit`, fd);
  }
}
