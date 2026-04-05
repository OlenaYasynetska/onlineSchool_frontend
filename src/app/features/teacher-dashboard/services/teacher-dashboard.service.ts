import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { SchoolGroupCard } from '../../school-admin/models/school-admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class TeacherDashboardService {
  constructor(private readonly http: HttpClient) {}

  /** Групи, де поточний користувач — призначений викладач. */
  listMyGroups(userId: string): Observable<SchoolGroupCard[]> {
    return this.http.get<SchoolGroupCard[]>(
      `${environment.apiUrl}/teacher/groups?userId=${encodeURIComponent(userId)}`
    );
  }
}
