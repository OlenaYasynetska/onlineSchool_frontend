import { signal } from '@angular/core';

export interface AboutCard {
  id: string;
  containerClass: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

export function useAboutCards() {
  return signal<AboutCard[]>([
    {
      id: 'goal',
      containerClass:
        'relative md:ml-8 flex items-start gap-4 rounded-xl bg-[#FFFFFF] px-5 py-4 shadow-sm md:max-w-[720px]',
      iconSrc: '/assets/icons/about/arrow.svg',
      iconAlt: 'Goal Achievement icon',
      title: 'Goal Achievement',
      description:
        'We help students stay motivated and reach their learning goals step by step.',
    },
    {
      id: 'gamified',
      containerClass:
        'relative ml-auto flex items-start gap-4 rounded-xl bg-[#FFFFFF] px-5 py-4 shadow-sm md:max-w-[520px]',
      iconSrc: '/assets/icons/about/Frame 474.svg',
      iconAlt: 'Gamified Motivation icon',
      title: 'Gamified Motivation',
      description:
        'Rewards, progress bars, and reminders turn studying into an engaging journey.',
    },
    {
      id: 'analytics',
      containerClass:
        'relative flex items-start gap-4 rounded-xl bg-[#FFFFFF] px-5 py-4 shadow-sm md:max-w-[720px]',
      iconSrc: '/assets/icons/about/loupe.svg',
      iconAlt: 'Analytics & Reports icon',
      title: 'Analytics & Reports',
      description:
        'Teachers get clear insights into student progress and group activity.',
    },
    {
      id: 'group',
      containerClass:
        'relative ml-auto flex items-start gap-4 rounded-xl bg-[#FFFFFF] px-5 py-4 shadow-sm md:max-w-[720px]',
      iconSrc: '/assets/icons/about/Frame 475.svg',
      iconAlt: 'Group Collaboration icon',
      title: 'Group Collaboration',
      description:
        'Easily manage study groups and assignments for a structured, effective learning process.',
    },
  ]);
}

