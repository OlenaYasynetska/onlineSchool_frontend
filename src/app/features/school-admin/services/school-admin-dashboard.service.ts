import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  SchoolAdminDashboardResponse,
  SchoolGroupCard,
  SchoolSubject,
  SchoolTeacher,
} from '../models/school-admin-dashboard.model';
import type { AddGroupPayload } from '../components/add-group-modal/add-group-modal.component';
import type { AddStudentPayload } from '../components/add-student-modal/add-student-modal.component';
import type { AddTeacherPayload } from '../components/add-teacher-modal/add-teacher-modal.component';

@Injectable({ providedIn: 'root' })
export class SchoolAdminDashboardService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(schoolId: string): Observable<SchoolAdminDashboardResponse> {
    return this.http.get<SchoolAdminDashboardResponse>(
      `${environment.apiUrl}/school-admin/dashboard?schoolId=${encodeURIComponent(
        schoolId
      )}`
    );
  }

  createGroup(
    schoolId: string,
    payload: AddGroupPayload
  ): Observable<SchoolGroupCard> {
    return this.http.post<SchoolGroupCard>(
      `${environment.apiUrl}/school-admin/groups?schoolId=${encodeURIComponent(
        schoolId
      )}`,
      payload
    );
  }

  listSubjects(schoolId: string): Observable<SchoolSubject[]> {
    return this.http.get<SchoolSubject[]>(
      `${environment.apiUrl}/school-admin/subjects?schoolId=${encodeURIComponent(
        schoolId
      )}`
    );
  }

  createSubject(schoolId: string, title: string): Observable<SchoolSubject> {
    return this.http.post<SchoolSubject>(
      `${environment.apiUrl}/school-admin/subjects?schoolId=${encodeURIComponent(
        schoolId
      )}`,
      { title }
    );
  }

  listTeachers(schoolId: string): Observable<SchoolTeacher[]> {
    return this.http.get<SchoolTeacher[]>(
      `${environment.apiUrl}/school-admin/teachers?schoolId=${encodeURIComponent(
        schoolId
      )}`
    );
  }

  createTeacher(
    schoolId: string,
    payload: AddTeacherPayload
  ): Observable<SchoolTeacher> {
    return this.http.post<SchoolTeacher>(
      `${environment.apiUrl}/school-admin/teachers?schoolId=${encodeURIComponent(
        schoolId
      )}`,
      {
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        password: payload.password,
        subjects: payload.subjects ?? null,
        phone: payload.phone?.trim() ? payload.phone.trim() : null,
      }
    );
  }

  /** Відповідь `POST /api/students` (StudentView). */
  createStudent(
    schoolId: string,
    payload: AddStudentPayload
  ): Observable<{
    id: string;
    fullName: string;
    email: string;
    schoolId: string;
    createdAt: string;
  }> {
    return this.http.post<{
      id: string;
      fullName: string;
      email: string;
      schoolId: string;
      createdAt: string;
    }>(`${environment.apiUrl}/students`, {
      fullName: payload.fullName,
      email: payload.email,
      schoolId,
    });
  }

  /** Зарахувати вже створеного студента до групи (`school_group_students` + лічильник на картці). */
  enrollStudentInGroup(
    schoolId: string,
    groupId: string,
    studentId: string
  ): Observable<void> {
    const params = new HttpParams()
      .set('schoolId', schoolId)
      .set('groupId', groupId);
    return this.http.post<void>(
      `${environment.apiUrl}/school-admin/groups/students`,
      { studentId },
      { params }
    );
  }

}

