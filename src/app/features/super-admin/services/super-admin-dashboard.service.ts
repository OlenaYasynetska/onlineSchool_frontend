import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type {
  OrganizationRow,
  PlanOverviewCard,
  SchoolAdminContactRow,
  SchoolAdminUpdatePayload,
  SchoolCard,
  SuperAdminDashboardResponse,
} from '../models/super-admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class SuperAdminDashboardService {
  constructor(private readonly http: HttpClient) {}

  getSchoolAdmins(): Observable<SchoolAdminContactRow[]> {
    return this.http.get<SchoolAdminContactRow[]>(
      `${environment.apiUrl}/super-admin/school-admins`
    );
  }

  updateSchoolAdmin(
    userId: string,
    payload: SchoolAdminUpdatePayload
  ): Observable<SchoolAdminContactRow> {
    return this.http.put<SchoolAdminContactRow>(
      `${environment.apiUrl}/super-admin/school-admins/${userId}`,
      payload
    );
  }

  /**
   * Деактивація акаунта (enabled=false), 204 без тіла.
   * POST + userId у тілі: стабільніший шлях без UUID у URL (уникає 404 «No static resource …/deactivate»).
   */
  deactivateSchoolAdmin(userId: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/super-admin/school-admins/deactivate`,
      { userId }
    );
  }

  reactivateSchoolAdmin(userId: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/super-admin/school-admins/reactivate`,
      { userId }
    );
  }

  getDashboard(): Observable<SuperAdminDashboardResponse> {
    return this.http
      .get<SuperAdminDashboardResponse>(`${environment.apiUrl}/super-admin/dashboard`)
      .pipe(
        map((data) => ({
          ...data,
          schools: this.resolveSchools(data),
          planOverview: data.planOverview.map((item) => ({
            ...item,
            accentClass: this.planAccent(item),
          })),
        }))
      );
  }

  /**
   * Картки шкіл + узгодження studentCount з `organizations` (той самий підрахунок з БД).
   * Якщо `schools` порожній — будуємо картки з organizations.
   */
  private resolveSchools(data: SuperAdminDashboardResponse): SchoolCard[] {
    const countByOrgId = new Map<string, number>();
    for (const o of data.organizations ?? []) {
      const n = o.studentCount;
      countByOrgId.set(o.id, typeof n === 'number' && !Number.isNaN(n) ? n : 0);
    }

    const fromApi = data.schools ?? [];
    if (fromApi.length > 0) {
      return fromApi.map((s) => ({
        ...s,
        studentCount: countByOrgId.has(s.id)
          ? (countByOrgId.get(s.id) as number)
          : Number(s.studentCount ?? 0),
      }));
    }

    const orgs = data.organizations ?? [];
    return orgs.map((org, i) => ({
      id: org.id,
      title: `School ${i + 1}`,
      displayName: org.name,
      address: this.addressForCard(org),
      plan: org.plan,
      studentCount: countByOrgId.get(org.id) ?? org.studentCount ?? 0,
    }));
  }

  private addressForCard(org: OrganizationRow): string {
    const raw = org.address?.trim();
    return raw && raw.length > 0 ? raw : '—';
  }

  private planAccent(item: PlanOverviewCard): string {
    switch (item.id) {
      case 'pro':
        return 'border-amber-500 bg-amber-50 text-amber-900';
      case 'standard':
        return 'border-blue-500 bg-blue-50 text-blue-900';
      default:
        return 'border-slate-400 bg-slate-100 text-slate-800';
    }
  }
}

