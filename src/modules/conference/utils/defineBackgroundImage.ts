import morning from '@/assets/conference/morning.png';
import afternoon from '@/assets/conference/afternoon.png';
import evening from '@/assets/conference/evening.png';
import night from '@/assets/conference/night.png';

import type { TimeOfDay } from './timeOfDay';

const BACKGROUND_IMAGES: Record<TimeOfDay, string> = {
  morning,
  afternoon,
  evening,
  night,
};

export function defineBackgroundImage(timeOfDay: TimeOfDay) {
  return BACKGROUND_IMAGES[timeOfDay];
}
