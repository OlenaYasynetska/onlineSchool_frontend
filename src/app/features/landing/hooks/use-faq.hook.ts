import { signal } from '@angular/core';

export interface FaqTab {
  id: string;
  label: string;
  className: string;
}

export interface FaqQuestion {
  id: string;
  text: string;
  answer: string;
}

export function useFaq() {
  const tabs = signal<FaqTab[]>([
    {
      id: 'about',
      label: 'About Learning',
      className: 'pb-1 hover:opacity-80 transition',
    },
    {
      id: 'motivation',
      label: 'Motivation & Progress',
      className: 'pb-1 hover:opacity-80 transition',
    },
    {
      id: 'support',
      label: 'Support & Security',
      className: 'pb-1 hover:opacity-80 transition',
    },
  ]);

  const questions = signal<FaqQuestion[]>([
    {
      id: 'q1',
      text: 'What if I lose motivation during my studies?',
      answer:
        'Owl Tracker helps you stay on track with reminders, progress insights, and small rewards that keep learning fun.',
    },
    {
      id: 'q2',
      text: 'How is my progress tracked?',
      answer:
        'Your progress is tracked through your activity and achievements. You can review your learning journey step by step.',
    },
    {
      id: 'q3',
      text: 'Is support available if I need help?',
      answer:
        'Yes. Your teachers can provide guidance and support. If you need help, you can reach out and get assistance.',
    },
  ]);

  return { tabs, questions };
}

