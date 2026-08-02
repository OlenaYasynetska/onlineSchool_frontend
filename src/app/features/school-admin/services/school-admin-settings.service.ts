import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { GradingMethod } from '../../../shared/hooks/use-grading-display.hook';

export interface SchoolSettingsDto {
  schoolId: string;
  gradingMethod: GradingMethod;
}

@Injectable({ providedIn: 'root' })
export class SchoolAdminSettingsService {
  constructor(private readonly http: HttpClient) {}

  getSettings(schoolId: string): Observable<SchoolSettingsDto> {
    return this.http.get<SchoolSettingsDto>(
      `${environment.apiUrl}/school-admin/settings?schoolId=${encodeURIComponent(schoolId)}`
    );
  }

  updateSettings(
    schoolId: string,
    gradingMethod: GradingMethod
  ): Observable<SchoolSettingsDto> {
    const url = `${environment.apiUrl}/school-admin/settings?schoolId=${encodeURIComponent(schoolId)}`;
    const body = { gradingMethod };
    return this.http.put<SchoolSettingsDto>(url, body);
  }
}
