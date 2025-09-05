import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TIMEZONES } from 'src/constants/constants';

dayjs.locale('ru');
dayjs.extend(utc);
dayjs.extend(timezone);

export const renderDateFormat = (date: string | Date | null) => {
  if (!date) return 'N/A';

  const d = new Date(date),
    year = d.getFullYear();
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export const renderShortNumericDateFormat = (date: string | Date) =>
  new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

export const findHowManyDaysLeft = (date: string | Date) => {
  const today = new Date();
  const eventDate = new Date(date);
  const timeDiff = Math.abs(eventDate.getTime() - today.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const getDatesInRange = (startDate: Date, endDate: Date) => {
  const date = new Date(startDate.getTime());
  const dates = [];
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

export const timeAgo = (time: any) => {
  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }

  const time_formats = [
    [60, 'секунд', 1], // 60
    [120, '1 минуту назад', '1 минуту с этого момента'], // 60*2
    [3600, 'минут', 60], // 60*60, 60
    [7200, '1 час назад', '1 час с этого момента'], // 60*60*2
    [18000, 'часа', 3600], // 60*60*2
    [86400, 'часов', 3600], // 60*60*24, 60*60
    [172800, 'Вчера', 'Завтра'], // 60*60*24*2
    [604800, 'дней', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'На прошлой неделе', 'На следующей неделе'], // 60*60*24*7*4*2
    [2419200, 'недель', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'В прошлом месяце', 'В следующем месяце'], // 60*60*24*7*4*2
    [29030400, 'месяцев', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'В прошлом году', 'В следующем году'], // 60*60*24*7*4*12*2
    [2903040000, 'лет', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'В прошлом веке', 'В следующем веке'], // 60*60*24*7*4*12*100*2
    [58060800000, 'веков', 2903040000], // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];

  let seconds = (+new Date() - time) / 1000,
    token = 'назад',
    list_choice = 1;

  if (seconds == 0) {
    return 'Только что';
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'с этого момента';
    list_choice = 2;
  }
  let i = 0,
    format;
  while ((format = time_formats[i++]))
    if (seconds < Number(format[0])) {
      if (typeof format[2] == 'string') return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
};

export const getDateRangeStatus = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) => {
  if (!startDate || !endDate) return 'draft';

  const today = renderDateFormat(new Date());
  const now = new Date(today);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start <= now && end >= now) {
    return 'current';
  } else if (start > now) {
    return 'upcoming';
  } else {
    return 'completed';
  }
};

export const renderShortDateWithYearFormat = (date: string | Date) => {
  if (!date || date === '') return null;

  date = new Date(date);

  const months = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return isNaN(date.getTime()) ? 'N/A' : ` ${month} ${day}, ${year}`;
};

export const renderShortDate = (date: string | Date, placeholder?: string) => {
  if (!date || date === '') return null;

  date = new Date(date);

  const months = [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return isNaN(date.getTime()) ? placeholder ?? 'N/A' : `${day} ${month}`;
};

export const renderShortTime = (date: string | Date) => {
  if (!date || date === '') return null;

  date = new Date(date);

  const hours = date.getHours();
  let minutes: any = date.getMinutes();

  // Add leading zero to single-digit minutes
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  return hours + ':' + minutes;
};

export const isDateRangeValid = (startDate: string, endDate: string) =>
  new Date(startDate) < new Date(endDate);

export const isDateGreaterThanToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date > today;
};

export const isTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return isToday;
};

export const renderLongDateFormat = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  const monthIndex = date.getMonth();
  const monthName = monthNames[monthIndex];
  const suffixes = ['', '', '', ''];
  let suffix = '';
  if (day === 1 || day === 21 || day === 31) {
    suffix = suffixes[0];
  } else if (day === 2 || day === 22) {
    suffix = suffixes[1];
  } else if (day === 3 || day === 23) {
    suffix = suffixes[2];
  } else {
    suffix = suffixes[3];
  }
  return `${day}${suffix} ${monthName} ${year}`;
};

export function renderDate(data: string) {
  return (
    new Date(data).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) +
    ' ' +
    new Date(data).toLocaleTimeString('it-IT')
  );
}

export function msToRussianTime(ms: number) {
  // Вычисляем количество дней, часов и минут

  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  // Функция для определения нужного словоформы
  const getEnding = (num: number, endings: any) => {
    // Падежи
    const cases = [2, 0, 1, 1, 1, 2];

    // Определяем номер падежа и возвращаем соответствующее словоформе
    return endings[
      num % 100 > 4 && num % 100 < 20 ? 2 : cases[num % 10 < 5 ? num % 10 : 5]
    ];
  };
  // Определяем нужные словоформы для дней, часов и минут
  const daysEnding = getEnding(days, ['день', 'дня', 'дней']);
  const hoursEnding = getEnding(hours, ['час', 'часа', 'часов']);
  const minutesEnding = getEnding(minutes, ['минута', 'минуты', 'минут']);

  // Создаем массив с частями времени
  const parts = [];
  if (days > 0) {
    parts.push(`${days} ${daysEnding}`);
  }
  if (hours > 0) {
    parts.push(`${hours} ${hoursEnding}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutesEnding}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'меньше минуты';
}

export const formatDate = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).locale('ru').tz(userTimezone).format('DD.MM.YYYY')
    : dayjs(date).locale('ru').format('DD.MM.YYYY');
};

export const formatDateTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).locale('ru').tz(userTimezone).format('DD.MM.YYYY HH:mm')
    : dayjs(date).locale('ru').format('DD.MM.YYYY HH:mm');
};

export const formatDateTimeWithDay = (date: string, userTimezone?: string) => {
  const formatDate = userTimezone
    ? dayjs(date).locale('ru').tz(userTimezone).format('dd. DD.MM.YYYY HH:mm')
    : dayjs(date).locale('ru').format('dd. DD.MM.YYYY HH:mm');

  return formatDate.charAt(0).toUpperCase() + formatDate.slice(1);
};

export const formatTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).locale('ru').tz(userTimezone).format('HH:mm')
    : dayjs(date).locale('ru').format('HH:mm');
};

export const getCityFromTimezone = (timezone: string) => {
  const tz = TIMEZONES.find((t) => t.value === timezone);
  if (!tz) return '';
  const labelParts = tz.label.split(' ');
  const cities = labelParts.slice(1).join('');
  return cities.split(',')[0];
};
