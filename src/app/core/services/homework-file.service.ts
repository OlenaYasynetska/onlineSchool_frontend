import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Завантаження / перегляд вкладень ДЗ через API (не жорстко http://localhost:8080).
 * Бекенд: GET .../teacher/homework/{id}/file та GET .../student/homework/submissions/{id}/file.
 */
@Injectable({ providedIn: 'root' })
export class HomeworkFileService {
  private readonly http = inject(HttpClient);

  downloadTeacherFile(userId: string, submissionId: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/teacher/homework/${encodeURIComponent(submissionId)}/file`,
      { params: { userId }, responseType: 'blob' },
    );
  }

  /** inline=true — коректний Content-Type + Content-Disposition: inline для PDF/зображень. */
  previewTeacherFile(userId: string, submissionId: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/teacher/homework/${encodeURIComponent(submissionId)}/file`,
      { params: { userId, inline: 'true' }, responseType: 'blob' },
    );
  }

  downloadStudentOwnFile(userId: string, submissionId: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/student/homework/submissions/${encodeURIComponent(submissionId)}/file`,
      { params: { userId }, responseType: 'blob' },
    );
  }

  previewStudentOwnFile(userId: string, submissionId: string): Observable<Blob> {
    return this.http.get(
      `${environment.apiUrl}/student/homework/submissions/${encodeURIComponent(submissionId)}/file`,
      { params: { userId, inline: 'true' }, responseType: 'blob' },
    );
  }

  triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.trim() || 'download';
    a.click();
    URL.revokeObjectURL(url);
  }

  openBlobInNewTab(blob: Blob, fileName: string): void {
    const lower = (fileName || '').toLowerCase();
    let b = blob;
    if (
      (!blob.type || blob.type === 'application/octet-stream') &&
      lower.endsWith('.pdf')
    ) {
      b = new Blob([blob], { type: 'application/pdf' });
    }
    const url = URL.createObjectURL(b);
    window.open(url, '_blank', 'noopener');
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  }
}
