import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  ScheduleSlot,
  UpsertSchedulePayload,
} from '../models/schedule-slot.model';

@Injectable({ providedIn: 'root' })
export class SchoolScheduleService {
  constructor(private readonly http: HttpClient) {}

  list(schoolId: string): Observable<ScheduleSlot[]> {
    return this.http.get<ScheduleSlot[]>(
      `${environment.apiUrl}/school-admin/schedule?schoolId=${encodeURIComponent(
        schoolId
      )}`
    );
  }

  create(
    schoolId: string,
    payload: UpsertSchedulePayload
  ): Observable<ScheduleSlot> {
    return this.http.post<ScheduleSlot>(
      `${environment.apiUrl}/school-admin/schedule?schoolId=${encodeURIComponent(
        schoolId
      )}`,
      payload
    );
  }

  update(
    schoolId: string,
    slotId: string,
    payload: UpsertSchedulePayload
  ): Observable<ScheduleSlot> {
    return this.http.put<ScheduleSlot>(
      `${environment.apiUrl}/school-admin/schedule/${encodeURIComponent(
        slotId
      )}?schoolId=${encodeURIComponent(schoolId)}`,
      payload
    );
  }

  delete(schoolId: string, slotId: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/school-admin/schedule/${encodeURIComponent(
        slotId
      )}?schoolId=${encodeURIComponent(schoolId)}`
    );
  }
}
