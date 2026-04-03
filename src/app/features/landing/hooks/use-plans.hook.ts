import { signal } from '@angular/core';

export interface PlanCard {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  features: string[];
}

export function usePlans() {
  return signal<PlanCard[]>([
    {
      id: 'free',
      title: 'Free Plan',
      subtitle: '(Forever Free)',
      image: '/assets/images/owl_free.png',
      features: ['Up to 200 users', '1 school administrator', 'Basic reports'],
    },
    {
      id: 'standard',
      title: 'Standard Plan',
      subtitle: '(for small schools)',
      image: '/assets/images/owl_standard.png',
      features: [
        'Up to 500 users',
        '2 school administrators',
        'Full analytics and progress reports',
      ],
    },
    {
      id: 'pro',
      title: 'Pro Plan',
      subtitle: '(for growing schools)',
      image: '/assets/images/owl_pro.png',
      features: ['Unlimited users', 'Advanced roles and permissions', 'Priority support'],
    },
  ]);
}

