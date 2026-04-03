import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { filter } from 'rxjs';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type { OrganizationRow } from '../../models/super-admin-dashboard.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-super-admin-organization-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './super-admin-organization-page.component.html',
})
export class SuperAdminOrganizationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dashboardApi = inject(SuperAdminDashboardService);

  loading = true;
  notFound = false;
  org: OrganizationRow | null = null;
  editMode = false;

  draft: OrganizationRow | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('organizationId');
      if (!id) {
        this.notFound = true;
        this.loading = false;
        this.org = null;
        this.draft = null;
        return;
      }
      this.loadOrganization(id);
    });

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncEditMode();
        if (this.org && this.editMode) {
          this.draft = this.copyDraftFromOrg(this.org);
        }
      });
  }

  private syncEditMode(): void {
    this.editMode = this.router.url.split('?')[0].endsWith('/edit');
  }

  private copyDraftFromOrg(source: OrganizationRow): OrganizationRow {
    return {
      ...source,
      address: source.address?.trim() ? source.address : '',
    };
  }

  private loadOrganization(id: string): void {
    this.loading = true;
    this.notFound = false;
    this.dashboardApi.getDashboard().subscribe({
      next: (data) => {
        const found = data.organizations.find((o) => o.id === id) ?? null;
        this.org = found;
        this.notFound = !found;
        this.syncEditMode();
        if (found) {
          this.draft = this.copyDraftFromOrg(found);
        } else {
          this.draft = null;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notFound = true;
        this.org = null;
        this.draft = null;
      },
    });
  }

  save(): void {
    if (!this.draft) return;
    // Placeholder until PATCH /api/super-admin/organizations/:id
    window.alert(
      'Saving to the server is not implemented yet. Your changes were not persisted.',
    );
  }

  cancelEdit(): void {
    const id = this.org?.id;
    if (id) {
      void this.router.navigate(['/super-admin/organizations', id]);
    } else {
      void this.router.navigate(['/super-admin/subscribers']);
    }
  }
}
