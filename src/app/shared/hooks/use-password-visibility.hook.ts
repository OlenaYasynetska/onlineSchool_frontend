import { computed, signal } from '@angular/core';

export interface PasswordVisibility {
  readonly visible: ReturnType<typeof signal<boolean>>;
  readonly inputType: ReturnType<typeof computed<'text' | 'password'>>;
  readonly toggleLabel: ReturnType<typeof computed<'Show' | 'Hide'>>;
  toggle(): void;
  hide(): void;
}

/** Перемикач видимості пароля для полів type=password (Show/Hide). */
export function usePasswordVisibility(initialVisible = false): PasswordVisibility {
  const visible = signal(initialVisible);
  const inputType = computed(() => (visible() ? 'text' : 'password'));
  const toggleLabel = computed(() => (visible() ? 'Hide' : 'Show'));

  function toggle(): void {
    visible.update((v) => !v);
  }

  function hide(): void {
    visible.set(false);
  }

  return { visible, inputType, toggleLabel, toggle, hide };
}
