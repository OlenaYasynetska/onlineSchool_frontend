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
import { SuperAdminDashboardService } from '../../../super-admin/services/super-admin-dashboard.service';
import { SchoolGridCardComponent } from '../../../super-admin/components/school-grid-card/school-grid-card.component';
import type { SchoolCard } from '../../../super-admin/models/super-admin-dashboard.model';
import { createSuperAdminSchoolsToolbarState } from '../../../super-admin/super-admin-schools-toolbar.state';
import {
  schoolPlanBadgeClass,
  schoolPlanBadgeLabel,
} from '../../../super-admin/school-plan-badge';

@Component({
  selector: 'app-schools-list',
  standalone: true,
  imports: [CommonModule, SchoolGridCardComponent],
  templateUrl: './schools-list.component.html',
})
export class SchoolsListComponent implements OnInit {
  private readonly dashboardApi = inject(SuperAdminDashboardService);
  private readonly filterHostRef =
    viewChild<ElementRef<HTMLElement>>('filterHost');

  loading = true;
  error: string | null = null;
  readonly schoolCards = signal<SchoolCard[]>([]);

  readonly schoolsUi = createSuperAdminSchoolsToolbarState(
    computed(() => this.schoolCards())
  );

  readonly schoolPlanBadgeClass = schoolPlanBadgeClass;
  readonly schoolPlanBadgeLabel = schoolPlanBadgeLabel;

  ngOnInit(): void {
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        this.schoolCards.set(data.schools ?? []);
        this.loading = false;
      },
      error: () => {
        this.error =
          'Could not load schools. Check that the API is running and you are online.';
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
}
