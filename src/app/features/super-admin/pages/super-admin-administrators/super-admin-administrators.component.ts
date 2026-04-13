import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailLinkComponent } from '../../../../shared/components/email-link/email-link.component';
import { SuperAdminDashboardService } from '../../services/super-admin-dashboard.service';
import type { SchoolAdminContactRow } from '../../models/super-admin-dashboard.model';
import { createSuperAdminSchoolAdminsSearchState } from '../../super-admin-school-admins-search.state';

@Component({
  selector: 'app-super-admin-administrators',
  standalone: true,
  imports: [CommonModule, EmailLinkComponent, ReactiveFormsModule],
  templateUrl: './super-admin-administrators.component.html',
})
export class SuperAdminAdministratorsComponent implements OnInit {
  private readonly api = inject(SuperAdminDashboardService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  readonly rows = signal<SchoolAdminContactRow[]>([]);

  readonly adminsUi = createSuperAdminSchoolAdminsSearchState(
    computed(() => this.rows())
  );

  readonly activeAdminCount = computed(
    () => this.rows().filter((r) => r.enabled !== false).length
  );

  readonly inactiveAdminCount = computed(
    () => this.rows().filter((r) => r.enabled === false).length
  );

  readonly editModalOpen = signal(false);
  readonly saveInProgress = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly deactivateTarget = signal<SchoolAdminContactRow | null>(null);
  readonly deactivateInProgress = signal(false);
  readonly deactivateError = signal<string | null>(null);
  /** Під час запиту — щоб вимкнути лише кнопку цього рядка. */
  readonly deactivatingUserId = signal<string | null>(null);

  readonly reactivateTarget = signal<SchoolAdminContactRow | null>(null);
  readonly reactivateInProgress = signal(false);
  readonly reactivateError = signal<string | null>(null);
  readonly reactivatingUserId = signal<string | null>(null);

  private editingUserId: string | null = null;
  /** Domain частини email при відкритті модалки (для збору email з поля Login). */
  private editingEmailDomain = '';

  readonly editForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    schoolName: [''],
    email: ['', [Validators.required, Validators.email]],
    login: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadSchoolAdmins();
  }

  private loadSchoolAdmins(): void {
    this.api.getSchoolAdmins().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  openEdit(row: SchoolAdminContactRow): void {
    if (row.enabled === false) {
      return;
    }
    this.editingUserId = row.userId;
    this.saveError.set(null);
    const at = row.email.indexOf('@');
    this.editingEmailDomain =
      at > 0 && at < row.email.length - 1 ? row.email.slice(at + 1) : '';
    this.editForm.setValue({
      fullName: row.fullName === '—' ? '' : row.fullName,
      schoolName: row.schoolName === '—' ? '' : row.schoolName,
      email: row.email,
      login: row.login === '—' ? '' : row.login,
      notes: row.notes ?? '',
    });
    this.editModalOpen.set(true);
  }

  closeEdit(): void {
    this.editModalOpen.set(false);
    this.editingUserId = null;
    this.editingEmailDomain = '';
    this.saveError.set(null);
    this.saveInProgress.set(false);
  }

  onEditBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeEdit();
    }
  }

  openDeactivateConfirm(row: SchoolAdminContactRow): void {
    this.deactivateError.set(null);
    this.deactivateTarget.set(row);
  }

  closeDeactivateConfirm(): void {
    this.deactivateTarget.set(null);
    this.deactivateError.set(null);
    this.deactivateInProgress.set(false);
    this.deactivatingUserId.set(null);
  }

  onDeactivateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.deactivateInProgress()) {
      this.closeDeactivateConfirm();
    }
  }

  confirmDeactivate(): void {
    const row = this.deactivateTarget();
    if (!row || this.deactivateInProgress()) {
      return;
    }
    this.deactivateInProgress.set(true);
    this.deactivatingUserId.set(row.userId);
    this.deactivateError.set(null);
    this.api.deactivateSchoolAdmin(row.userId).subscribe({
      next: () => {
        this.deactivateInProgress.set(false);
        this.deactivatingUserId.set(null);
        this.closeDeactivateConfirm();
        this.loadSchoolAdmins();
      },
      error: (err: unknown) => {
        this.deactivateInProgress.set(false);
        this.deactivatingUserId.set(null);
        this.deactivateError.set(this.messageFromHttpError(err));
      },
    });
  }

  openReactivateConfirm(row: SchoolAdminContactRow): void {
    this.reactivateError.set(null);
    this.reactivateTarget.set(row);
  }

  closeReactivateConfirm(): void {
    this.reactivateTarget.set(null);
    this.reactivateError.set(null);
    this.reactivateInProgress.set(false);
    this.reactivatingUserId.set(null);
  }

  onReactivateBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.reactivateInProgress()) {
      this.closeReactivateConfirm();
    }
  }

  confirmReactivate(): void {
    const row = this.reactivateTarget();
    if (!row || this.reactivateInProgress()) {
      return;
    }
    this.reactivateInProgress.set(true);
    this.reactivatingUserId.set(row.userId);
    this.reactivateError.set(null);
    this.api.reactivateSchoolAdmin(row.userId).subscribe({
      next: () => {
        this.reactivateInProgress.set(false);
        this.reactivatingUserId.set(null);
        this.closeReactivateConfirm();
        this.loadSchoolAdmins();
      },
      error: (err: unknown) => {
        this.reactivateInProgress.set(false);
        this.reactivatingUserId.set(null);
        this.reactivateError.set(this.messageFromHttpError(err));
      },
    });
  }

  submitEdit(): void {
    if (this.editForm.invalid || !this.editingUserId || this.saveInProgress()) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.getRawValue();
    const payload = {
      fullName: v.fullName,
      schoolName: v.schoolName,
      email: this.resolveEmailForSave(v.email, v.login),
      login: v.login,
      notes: v.notes,
    };
    this.saveInProgress.set(true);
    this.saveError.set(null);
    this.api.updateSchoolAdmin(this.editingUserId, payload).subscribe({
      next: (updated) => {
        this.rows.update((list) =>
          list.map((r) => (r.userId === updated.userId ? updated : r))
        );
        this.saveInProgress.set(false);
        this.closeEdit();
      },
      error: (err: unknown) => {
        this.saveInProgress.set(false);
        this.saveError.set(this.messageFromHttpError(err));
      },
    });
  }

  private messageFromHttpError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.trim()) {
        return body;
      }
      if (body && typeof body === 'object' && 'message' in body) {
        const m = (body as { message?: string }).message;
        if (typeof m === 'string' && m.trim()) {
          return m;
        }
      }
      if (err.status === 409) {
        return 'This email is already in use.';
      }
      if (err.status === 0) {
        return 'Could not reach the server. Check that the API is running.';
      }
    }
    return 'Save failed. Please try again.';
  }

  /**
   * Якщо змінили лише login — підставляємо його в локальну частину email (той самий домен).
   */
  private resolveEmailForSave(emailRaw: string, loginRaw: string): string {
    const emailTrimmed = emailRaw.trim();
    const loginTrimmed = loginRaw.trim();
    if (emailTrimmed.includes('@')) {
      const at = emailTrimmed.indexOf('@');
      const local = emailTrimmed.slice(0, at);
      const domain = emailTrimmed.slice(at + 1);
      if (
        loginTrimmed.length > 0 &&
        loginTrimmed.toLowerCase() !== local.toLowerCase()
      ) {
        return `${loginTrimmed}@${domain}`;
      }
      return emailTrimmed;
    }
    if (loginTrimmed.length > 0 && this.editingEmailDomain.length > 0) {
      return `${loginTrimmed}@${this.editingEmailDomain}`;
    }
    return emailTrimmed;
  }
}
