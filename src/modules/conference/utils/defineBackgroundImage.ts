import morning from 'assets/morning.png';
import afternoon from 'assets/afternoon.png';
import evening from 'assets/evening.png';
import night from 'assets/night.png';

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
  }
}
