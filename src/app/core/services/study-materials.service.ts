import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeacherSubjectOption {
  id: string;
  title: string;
}

export interface StudyMaterialSetDto {
  id: string;
  title: string;
  description: string | null;
  teacherSubjectId: string | null;
  teacherSubjectTitle: string | null;
  lessonCount: number;
  updatedAt: string;
}

export interface StudyMaterialLessonDto {
  id: string;
  title: string;
  sortOrder: number;
  fileName: string;
  issuuEmbedUrl: string | null;
}

export interface CreateStudyMaterialSetBody {
  title: string;
  description?: string | null;
  teacherSubjectId: string;
}

@Injectable({ providedIn: 'root' })
export class StudyMaterialsService {
  private readonly http = inject(HttpClient);

  /** Teacher */
  listTeacherSubjects(userId: string): Observable<TeacherSubjectOption[]> {
    return this.http.get<TeacherSubjectOption[]>(
      `${environment.apiUrl}/teacher/study-materials/subjects`,
      { params: { userId } }
    );
  }

  listTeacherSets(userId: string): Observable<StudyMaterialSetDto[]> {
    return this.http.get<StudyMaterialSetDto[]>(
      `${environment.apiUrl}/teacher/study-materials/sets`,
      { params: { userId } }
    );
  }

  createTeacherSet(
    userId: string,
    body: CreateStudyMaterialSetBody
  ): Observable<StudyMaterialSetDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<StudyMaterialSetDto>(
      `${environment.apiUrl}/teacher/study-materials/sets`,
      body,
      { params }
    );
  }

  listTeacherLessons(
    userId: string,
    setId: string
  ): Observable<StudyMaterialLessonDto[]> {
    return this.http.get<StudyMaterialLessonDto[]>(
      `${environment.apiUrl}/teacher/study-materials/sets/${encodeURIComponent(
        setId
      )}/lessons`,
      { params: { userId } }
    );
  }

  uploadTeacherLessonPdf(
    userId: string,
    setId: string,
    title: string,
    file: File
  ): Observable<StudyMaterialLessonDto> {
    const fd = new FormData();
    fd.set('file', file, file.name);
    const params = new HttpParams()
      .set('userId', userId)
      .set('title', title);
    return this.http.post<StudyMaterialLessonDto>(
      `${environment.apiUrl}/teacher/study-materials/sets/${encodeURIComponent(
        setId
      )}/lessons`,
      fd,
      { params }
    );
  }

  getTeacherLessonPdfBlob(
    userId: string,
    lessonId: string,
    inline: boolean
  ): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/teacher/study-materials/lessons/${encodeURIComponent(
        lessonId
      )}/pdf`,
      {
        params: { userId, inline: String(inline) },
        responseType: 'blob',
      }
    );
  }

  patchTeacherSet(
    userId: string,
    setId: string,
    body: { title: string; description: string | null }
  ): Observable<StudyMaterialSetDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.patch<StudyMaterialSetDto>(
      `${environment.apiUrl}/teacher/study-materials/sets/${encodeURIComponent(setId)}`,
      body,
      { params }
    );
  }

  patchTeacherLesson(
    userId: string,
    lessonId: string,
    body: { title: string; issuuEmbedUrl: string | null }
  ): Observable<StudyMaterialLessonDto> {
    const params = new HttpParams().set('userId', userId);
    return this.http.patch<StudyMaterialLessonDto>(
      `${environment.apiUrl}/teacher/study-materials/lessons/${encodeURIComponent(lessonId)}`,
      body,
      { params }
    );
  }

  deleteTeacherSet(userId: string, setId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(
      `${environment.apiUrl}/teacher/study-materials/sets/${encodeURIComponent(setId)}`,
      { params }
    );
  }

  deleteTeacherLesson(userId: string, lessonId: string): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.delete<void>(
      `${environment.apiUrl}/teacher/study-materials/lessons/${encodeURIComponent(lessonId)}`,
      { params }
    );
  }

  /** Student */
  listStudentSets(userId: string): Observable<StudyMaterialSetDto[]> {
    return this.http.get<StudyMaterialSetDto[]>(
      `${environment.apiUrl}/student/study-materials/sets`,
      { params: { userId } }
    );
  }

  listStudentLessons(
    userId: string,
    setId: string
  ): Observable<StudyMaterialLessonDto[]> {
    return this.http.get<StudyMaterialLessonDto[]>(
      `${environment.apiUrl}/student/study-materials/sets/${encodeURIComponent(
        setId
      )}/lessons`,
      { params: { userId } }
    );
  }

  getStudentLessonPdfBlob(
    userId: string,
    lessonId: string,
    inline: boolean
  ): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/student/study-materials/lessons/${encodeURIComponent(
        lessonId
      )}/pdf`,
      {
        params: { userId, inline: String(inline) },
        responseType: 'blob',
      }
    );
  }

  /** School admin */
  listAdminSets(schoolId: string): Observable<StudyMaterialSetDto[]> {
    return this.http.get<StudyMaterialSetDto[]>(
      `${environment.apiUrl}/school-admin/study-materials/sets`,
      { params: { schoolId } }
    );
  }

  listAdminLessons(
    schoolId: string,
    setId: string
  ): Observable<StudyMaterialLessonDto[]> {
    return this.http.get<StudyMaterialLessonDto[]>(
      `${environment.apiUrl}/school-admin/study-materials/sets/${encodeURIComponent(
        setId
      )}/lessons`,
      { params: { schoolId } }
    );
  }

  getAdminLessonPdfBlob(
    schoolId: string,
    lessonId: string,
    inline: boolean
  ): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/school-admin/study-materials/lessons/${encodeURIComponent(
        lessonId
      )}/pdf`,
      {
        params: { schoolId, inline: String(inline) },
        responseType: 'blob',
      }
    );
  }
}
