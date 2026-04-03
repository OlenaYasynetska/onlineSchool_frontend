export interface HeroContent {
  brand: string;
  titleLines: [string, string];
  description: string;
}

export function useHeroContent(): HeroContent {
  return {
    brand: 'Owl Tracker',
    titleLines: ['The right motivation', 'for great achievements'],
    description:
      'We help students stay motivated and reach their learning goals step by step.',
  };
}

