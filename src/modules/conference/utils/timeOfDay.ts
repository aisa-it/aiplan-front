export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getCurrentTimeOfDay(): TimeOfDay {
  const hours = new Date().getHours();

  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 22) return 'evening';
  return 'night';
}
