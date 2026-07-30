import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type {
  PaymentHistoryRow,
  SuperAdminDashboardResponse,
} from '../../models/super-admin-dashboard.model';
import { SchoolGridCardComponent } from '../../components/school-grid-card/school-grid-card.component';
import { OrganizationGridCardComponent } from '../../components/organization-grid-card/organization-grid-card.component';
import { createSuperAdminOrganizationsSearchState } from '../../super-admin-organizations-search.state';
import { createSuperAdminSchoolsToolbarState } from '../../super-admin-schools-toolbar.state';
import {
  schoolPlanBadgeClass,
  schoolPlanBadgeLabel,
} from '../../school-plan-badge';
import { useResponsiveAdminTableLayout } from '../../../../shared/hooks/use-responsive-admin-table-layout.hook';
import { organizationStatusClass } from '../../hooks/use-organization-status-style.hook';

const emptyDash: SuperAdminDashboardResponse = {
  planOverview: [],
  schools: [],
  organizations: [],
  payments: [],
};

@Component({
  selector: 'app-super-admin-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SchoolGridCardComponent, OrganizationGridCardComponent],
  templateUrl: './super-admin-page.component.html',
})
export class SuperAdminPageComponent implements OnInit {
  private readonly dashboardApi = inject(SuperAdminDashboardService);
  private readonly filterHostRef =
    viewChild<ElementRef<HTMLElement>>('filterHost');

  loading = true;
  readonly dash = signal<SuperAdminDashboardResponse>(emptyDash);

  /** Стан пошуку / фільтрів / вигляду блоку Schools (композиція-функція). */
  readonly schoolsUi = createSuperAdminSchoolsToolbarState(
    computed(() => this.dash().schools)
  );

  readonly orgsUi = createSuperAdminOrganizationsSearchState(
    computed(() => this.dash().organizations)
  );

  /** Для шаблону: чисті функції бейджа плану. */
  readonly schoolPlanBadgeClass = schoolPlanBadgeClass;
  readonly schoolPlanBadgeLabel = schoolPlanBadgeLabel;
  readonly tableLayout = useResponsiveAdminTableLayout();
  readonly organizationStatusClass = organizationStatusClass;

  ngOnInit(): void {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.dash.set(data);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.schoolsUi.onOutsideClick(
      this.filterHostRef()?.nativeElement ?? null,
      event.target as Node
    );
  }

  paymentStatusClass(status: PaymentHistoryRow['status']): string {
    switch (status) {
      case 'Paid':
        return 'text-xs font-semibold text-emerald-700';
      case 'Pending payment':
        return 'text-xs font-semibold text-amber-700';
      case 'Failed':
        return 'text-xs font-semibold text-red-600';
      default:
        return '';
    }
  }
}
