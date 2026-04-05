import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  HomeworkSubmission,
  StudentGroupOption,
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

  submit(params: {
    userId: string;
    teacherId: string;
    groupId?: string;
    subjectTitle: string;
    messageText?: string;
    file: File;
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
    fd.append('file', params.file, params.file.name);
    return this.http.post<HomeworkSubmission>(`${this.base()}/submit`, fd);
  }
}
