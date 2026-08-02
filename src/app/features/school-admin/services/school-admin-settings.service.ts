import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  GradingMethod,
  GradingScale,
} from '../../../shared/hooks/use-grading-display.hook';

export interface SchoolSettingsDto {
  schoolId: string;
  gradingMethod: GradingMethod;
  gradingScale: GradingScale;
}

export interface UpdateSchoolSettingsBody {
  gradingMethod: GradingMethod;
  gradingScale: GradingScale;
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
    body: UpdateSchoolSettingsBody
  ): Observable<SchoolSettingsDto> {
    const url = `${environment.apiUrl}/school-admin/settings?schoolId=${encodeURIComponent(schoolId)}`;
    return this.http.put<SchoolSettingsDto>(url, body);
  }
}
