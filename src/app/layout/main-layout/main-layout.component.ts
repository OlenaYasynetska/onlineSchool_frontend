import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import type { FooterVariant } from '../footer/footer.component';
import { ChatContactsPanelComponent } from '../chat-contacts-panel/chat-contacts-panel.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    FooterComponent,
    ChatContactsPanelComponent,
  ],
  host: {
    class: 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
  },
  template: `
    <div class="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden">
      @if (shouldShowSidebar()) {
        <app-sidebar />
        @if (showChatContactsPanel()) {
          <app-chat-contacts-panel />
        }
      }
      <main
        class="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-slate-100"
        [class.overflow-y-auto]="!isChatPage()"
        [class.overflow-hidden]="isChatPage()"
        [class.pl-0]="shouldShowSidebar()"
        [class.pr-3]="shouldShowSidebar()"
        [class.sm:pr-6]="shouldShowSidebar()"
        [class.lg:pr-8]="shouldShowSidebar()"
        [class.pt-3]="shouldShowSidebar()"
        [class.sm:pt-4]="shouldShowSidebar()"
        [class.pb-3]="shouldShowSidebar() && !isChatPage()"
        [class.sm:pb-4]="shouldShowSidebar() && !isChatPage()"
      >
        <router-outlet />
      </main>
    </div>
    <div class="w-full min-w-0 shrink-0">
      <app-footer />
    </div>
  `,
})
export class MainLayoutComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  /** Панель контактів чату — лише учень / учитель у кабінеті. */
  showChatContactsPanel(): boolean {
    const role = this.auth.currentUser()?.role;
    if (role !== 'TEACHER' && role !== 'STUDENT') {
      return false;
    }
    const path = this.router.url.split('?')[0];
    return path.startsWith('/teacher') || path.startsWith('/student');
  }

  footerVariant(): FooterVariant {
    return this.router.url.split('?')[0].startsWith('/super-admin')
      ? 'detailed'
      : 'simple';
  }

  shouldShowSidebar(): boolean {
    const url = this.router.url;
    return (
      url.startsWith('/dashboard') ||
      url.startsWith('/teacher') ||
      url.startsWith('/student') ||
      url.startsWith('/school-admin') ||
      url.startsWith('/students') ||
      url.startsWith('/teachers') ||
      url.startsWith('/schools') ||
      url.startsWith('/analytics') ||
      url.startsWith('/super-admin')
    );
  }

  /** Чат: повна висота main, поле вводу внизу без «провисання» через scroll на main. */
  isChatPage(): boolean {
    const path = this.router.url.split('?')[0];
    return path === '/teacher/chat' || path === '/student/chat';
  }
}
