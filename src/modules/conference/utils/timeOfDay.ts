export function getCurrentTimeOfDay() {
  const now = new Date();
  const hours = now.getHours();

  let timeOfDay;
  if (hours >= 5 && hours < 12) {
    timeOfDay = 'morning';
  } else if (hours >= 12 && hours < 17) {
    timeOfDay = 'afternoon';
  } else if (hours >= 17 && hours < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }

  return {
    time: now.toLocaleTimeString(),
    timeOfDay: timeOfDay,
  };
}
