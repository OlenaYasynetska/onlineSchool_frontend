export interface ButtonConfig {
  label: string;
  className: string;
}

export function useLandingButtons() {
  const subscribeNow: ButtonConfig = {
    label: 'Subscribe now',
    className:
      'inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 transition',
  };

  const subscribePlans: ButtonConfig = {
    label: 'Subscribe',
    className:
      'w-full rounded-lg bg-[#E6942E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d8831a] transition',
  };

  return {
    subscribeNow,
    subscribePlans,
  };
}

