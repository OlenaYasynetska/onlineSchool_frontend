import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'owl_tracker_pwa_install_dismissed';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private readonly platformId = inject(PLATFORM_ID);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly canInstall = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      if (localStorage.getItem(DISMISS_KEY) !== '1') {
        this.canInstall.set(true);
      }
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
    });
  }

  async install(): Promise<void> {
    const promptEvent = this.deferredPrompt;
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    await promptEvent.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
  }

  dismiss(): void {
    this.canInstall.set(false);
    localStorage.setItem(DISMISS_KEY, '1');
  }
}
