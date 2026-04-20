import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { ScheduleSlot } from '../models/schedule-slot.model';

@Injectable({ providedIn: 'root' })
export class ScheduleReadService {
  constructor(private readonly http: HttpClient) {}

  /** Розклад для викладача (лише читання). */
  teacherSchedule(userId: string): Observable<ScheduleSlot[]> {
    return this.http.get<ScheduleSlot[]>(
      `${environment.apiUrl}/teacher/schedule?userId=${encodeURIComponent(
        userId
      )}`
    );
  }

  /** Розклад для учня за групами (лише читання). */
  studentSchedule(userId: string): Observable<ScheduleSlot[]> {
    return this.http.get<ScheduleSlot[]>(
      `${environment.apiUrl}/student/schedule?userId=${encodeURIComponent(
        userId
      )}`
    );
  }
}
