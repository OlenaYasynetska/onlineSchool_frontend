import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ChatUiService } from '../../core/services/chat-ui.service';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly chatUi = inject(ChatUiService);

  private readonly destroy$ = new Subject<void>();

  peerId: string | null = null;
  peerKind: 'teacher' | 'student' | null = null;
  peerDisplayName = '';

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const peer = params.get('peer');
      const kind = params.get('kind');
      this.peerId = peer?.trim() || null;
      this.peerKind = kind === 'teacher' || kind === 'student' ? kind : null;
      const nameQ = params.get('name')?.trim();
      const rec =
        this.peerId && this.peerKind
          ? this.chatUi
              .readRecent()
              .find((e) => e.peerId === this.peerId && e.kind === this.peerKind)
          : undefined;
      this.peerDisplayName =
        nameQ ||
        rec?.displayName ||
        (this.peerKind === 'teacher' ? 'Teacher' : this.peerKind === 'student' ? 'Student' : '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleContacts(): void {
    this.chatUi.toggleContactsPanel();
  }

  clearPeer(): void {
    const base =
      this.auth.currentUser()?.role === 'TEACHER' ? '/teacher/chat' : '/student/chat';
    void this.router.navigate([base], { replaceUrl: true });
    this.peerId = null;
    this.peerKind = null;
    this.peerDisplayName = '';
  }
}
