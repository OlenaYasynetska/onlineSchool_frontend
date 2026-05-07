/**
 * Єдиний вигляд панелі «Messages» для учня та вчителя.
 * Стилі скролбару підключаються глобально: src/styles/chat-contacts-scrollbar.css (імпорт з global.css).
 */
export const CHAT_CONTACTS_PANEL_SCROLL_CLASSNAME = 'chat-contacts-panel-scroll';

export const CHAT_CONTACTS_PANEL_HEADER_CLASSES =
  'flex shrink-0 flex-col gap-2 border-b border-slate-200 bg-slate-50/90 px-3 pb-2 pt-2 dark:border-gray-700 dark:bg-gray-900';

export function chatContactsPanelScrollBodyClasses(): string {
  return [
    CHAT_CONTACTS_PANEL_SCROLL_CLASSNAME,
    'min-h-0',
    'flex-1',
    'overflow-y-auto',
    'overflow-x-hidden',
    'px-2',
    'pt-1',
    'pb-3',
  ].join(' ');
}

export interface ChatContactsPanelLayout {
  readonly headerClasses: string;
  readonly scrollBodyClasses: string;
}

export function useChatContactsPanelLayout(): ChatContactsPanelLayout {
  return {
    headerClasses: CHAT_CONTACTS_PANEL_HEADER_CLASSES,
    scrollBodyClasses: chatContactsPanelScrollBodyClasses(),
  };
}
