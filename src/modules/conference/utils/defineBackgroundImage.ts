import morning from '@/assets/conference/morning.png';
import afternoon from '@/assets/conference/afternoon.png';
import evening from '@/assets/conference/evening.png';
import night from '@/assets/conference/night.png';

export function defineBackgroundImage(timeOfDay: string) {
  switch (timeOfDay) {
    case 'morning':
      return morning;
    case 'afternoon':
      return afternoon;
    case 'evening':
      return evening;
    case 'night':
      return night;
    default:
      return afternoon;
  }
}
