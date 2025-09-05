export const LOCALE_DATE = {
    /* starting with Sunday */
    days: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятницв_Суббота'.split(
      '_',
    ),
    daysShort: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
    months:
      'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
        '_',
      ),
    monthsShort: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split(
      '_',
    ),
    firstDayOfWeek: 1, // 0-6, 0 - Sunday, 1 Monday, ...
    format24h: true,
    pluralDay: 'dias',
  }