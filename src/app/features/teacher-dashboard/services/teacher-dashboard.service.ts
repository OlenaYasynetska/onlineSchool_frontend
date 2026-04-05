import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  SchoolGroupCard,
  StudentRow,
} from '../../school-admin/models/school-admin-dashboard.model';

export interface TeacherActivityEntry {
  date: string;
  studentName: string;
  change: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  constructor(private readonly http: HttpClient) {}

  /** Групи, де поточний користувач — призначений викладач. */
  listMyGroups(userId: string): Observable<SchoolGroupCard[]> {
    return this.http.get<SchoolGroupCard[]>(
      `${environment.apiUrl}/teacher/groups?userId=${encodeURIComponent(userId)}`
    );
  }

  /** Студенти з груп цього вчителя (БД). */
  listMyStudents(userId: string): Observable<StudentRow[]> {
    return this.http.get<StudentRow[]>(
      `${environment.apiUrl}/teacher/students?userId=${encodeURIComponent(userId)}`
    );
  }

  /** Останні зарахування на групи (БД). */
  listMyActivity(userId: string): Observable<TeacherActivityEntry[]> {
    return this.http.get<TeacherActivityEntry[]>(
      `${environment.apiUrl}/teacher/activity?userId=${encodeURIComponent(userId)}`
    );
  }
}
