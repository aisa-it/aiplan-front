import type { ProfileTabName } from '../composables/useProfileTabs';

export default {
  title: 'Настройки профиля',
  tabs: {
    general: 'Основные',
    activities: 'Активности',
    design: 'Оформление',
  } satisfies Record<ProfileTabName, string>,
  avatar: {
    description: 'Поддерживается .jpg, .png и .gif не более 20 Мб.',
    dialogTitle: 'Загрузить аватар (не более 20 Мб)',
    dropActive: 'Перетащите файл сюда...',
    dropIdle: 'Перетащите или нажмите, чтобы выбрать файл',
    errorTitle: 'При загрузке произошла ошибка',
    errorHint:
      'Убедитесь, что Вы загружаете файл в формате JPEG, GIF или PNG и попробуйте снова.',
    errorHintWithLimit:
      'Убедитесь, что Вы загружаете файл в формате JPEG, GIF или PNG не более 20 Мб и попробуйте снова.',
  },
  data: {
    fullName: {
      description: 'Ваши фамилия и имя',
      firstNameLabel: 'Введите имя',
      lastNameLabel: 'Введите фамилию',
    },
    email: {
      description: 'Ваш адрес электронной почты',
      label: 'Введите email',
    },
    username: {
      description: 'Ваше имя пользователя в системе',
      label: 'Введите имя пользователя',
    },
    telegramId: {
      description:
        'Ваш telegram id для получения уведомлений. Напишите {bot} для получения id',
      bot: 'боту',
      label: 'Введите Telegram ID',
    },
    timezone: {
      description: 'Ваш часовой пояс для отображения времени в уведомлениях',
      label: 'Ваш часовой пояс',
    },
    token: {
      description: 'Токен для авторизации',
      reset: 'Сбросить токен',
      copy: 'Скопировать токен',
    },
  },
  password: {
    heading: 'Смена пароля',
    new: {
      title: 'Новый пароль',
      description: 'Введите новый пароль',
    },
    repeat: {
      title: 'Новый пароль (повторно)',
      description: 'Введите новый пароль ещё раз',
    },
    label: 'Введите пароль',
    submit: 'Сменить пароль',
  },
  notifications: {
    heading: 'Настройки уведомлений',
    description:
      'При деактивации параметра блокирует все уведомления данного типа, включая проектные настройки.',
    channels: {
      app: 'Система',
    },
    channelAria: 'Уведомления: {channel}',
    deadlineDescription:
      'Выберите за сколько вы хотите получать уведомление об истечении срока задачи',
    deadline: {
      hours: '{n} час | {n} часа | {n} часов',
      days: '{n} день | {n} дня | {n} дней',
    },
  },
  activities: {
    empty: 'У пользователя не было активности',
    notEnoughData: 'Недостаточно данных для отображения активности по дням',
  },
  design: {
    language: {
      description: 'Язык интерфейса',
    },
    theme: {
      description: 'Выберите тему',
      system: 'Системная',
      options: {
        dark: 'Темная',
        light: 'Светлая',
      },
    },
    issueOpen: {
      title: 'Просмотр задачи',
      description: 'Выберите как открывать задачи',
      label: 'Просмотр задачи',
      options: {
        newWindow: 'В новом окне',
        currentPage: 'На текущей странице',
      },
    },
    autoSave: {
      title: 'Автосохранение',
      description: 'Автосохранение изменений в редакторе',
      label: 'Автосохранение',
      options: {
        enabled: 'Автосохранение включено',
        disabled: 'Автосохранение выключено',
      },
    },
    snow: {
      title: 'Осадки',
      description: 'Осадки в новогодней теме',
      label: 'Осадки',
      densityLabel: 'Плотность осадков',
      density: {
        low: 'Мало',
        medium: 'Средне',
        high: 'Много',
      },
    },
  },
  validation: {
    required: {
      firstName: 'Необходимо ввести имя',
      lastName: 'Необходимо ввести фамилию',
      username: 'Необходимо ввести имя пользователя',
      password: 'Необходимо ввести пароль',
    },
    maxLength: 'Максимальный размер — {length} символов',
    nameCharacters: {
      firstName:
        'Имя может содержать латинские или кириллические буквы и спец. символ дефис (-)',
      lastName:
        'Фамилия может содержать латинские или кириллические буквы и спец. символ дефис (-)',
    },
    containsLetter: {
      firstName:
        'Имя должно содержать минимум одну букву латинского или кириллического алфавита',
      lastName:
        'Фамилия должна содержать минимум одну букву латинского или кириллического алфавита',
    },
    usernameCharacters:
      'Имя пользователя может содержать буквы латинского алфавита и спец. символы: точка(.), нижнее подчеркивание(_), дефис (-), слэш прямой и обратный (/, \\), цифры (0-9)',
    usernameContainsLetter:
      'Имя пользователя должно содержать минимум одну букву латинского алфавита',
    telegramId: 'Telegram ID может содержать только цифры',
    email: 'Некорректный email',
    passwordsMismatch: 'Пароли не совпадают',
    usernameTaken: 'Пользователь с таким именем уже существует',
  },
};
