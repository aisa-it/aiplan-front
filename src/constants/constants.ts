import { formatDate, formatDateTime } from 'src/utils/time';

export const NON_VALIDATED_ROUTES = [
  '#/',
  '/reset-password',
  '/workspace-member-invitation',
];

export const RESTRICTED_URLS = [
  'api',
  'create-workspace',
  'error',
  'installations',
  'invitations',
  'magic-sign-in',
  'onboarding',
  'reset-password',
  'signin',
  'signup',
  'workspace-member-invitation',
  '404',
  'undefined',
  'no-workspace',
  'service-unavailable',
  'not-found',
  'admin-panel',
  'profile',
  'conference',
];

export const STATES_TYPES = [
  {
    value: 'backlog',
    label: 'Создано',
  },
  {
    value: 'unstarted',
    label: 'Не начато',
  },
  {
    value: 'started',
    label: 'Начато',
  },
  {
    value: 'completed',
    label: 'Завершено',
  },
  {
    value: 'cancelled',
    label: 'Отменено',
  },
];

export const STATES_GROUPS = [
  'backlog',
  'unstarted',
  'started',
  'completed',
  'cancelled',
];

export const STATES_COLORS = [
  '#FF6900',
  '#FCB900',
  '#7BDCB5',
  '#00D084',
  '#8ED1FC',
  '#0693E3',
  '#ABB8C3',
  '#EB144C',
  '#F78DA7',
  '#9900EF',
];

export const NETWORK_CHOICES = [
  { value: false, label: 'Скрытый' },
  { value: true, label: 'Публичный' },
];

export const PROJECT_VIEWS = [
  { value: 'list', label: 'Список' },
  { value: 'kanban', label: 'Доска' },
];

export const SPRINT_VIEWS = [
  ...PROJECT_VIEWS,
  { value: 'gantt_chart', label: 'Диаграмма Ганта' },
];

export const GROUP_BY_OPTIONS = [
  { value: 'None', label: 'Нет' },
  { value: 'State', label: 'Статус' },
  { value: 'Label', label: 'Теги' },
  { value: 'Priority', label: 'Приоритет' },
  { value: 'Created by', label: 'Автор' },
  { value: 'Assignee to', label: 'Исполнитель' },
  { value: 'Watchers', label: 'Наблюдатель' },
];
export const NEW_GROUP_BY_OPTIONS = [
  { value: 'none', label: 'Нет' },
  { value: 'state', label: 'Статус' },
  { value: 'labels', label: 'Теги' },
  { value: 'priority', label: 'Приоритет' },
  { value: 'author', label: 'Автор' },
  { value: 'assignees', label: 'Исполнитель' },
  { value: 'watchers', label: 'Наблюдатель' },
];

export const SPRINT_GROUP_BY_OPTIONS = [
  ...NEW_GROUP_BY_OPTIONS,
  { value: 'project', label: 'Проект' },
];

export const PARSED_GROUP = {
  None: NEW_GROUP_BY_OPTIONS[0],
  State: NEW_GROUP_BY_OPTIONS[1],
  Label: NEW_GROUP_BY_OPTIONS[2],
  Priority: NEW_GROUP_BY_OPTIONS[3],
  'Created by': NEW_GROUP_BY_OPTIONS[4],
  'Assignee to': NEW_GROUP_BY_OPTIONS[5],
  Watchers: NEW_GROUP_BY_OPTIONS[6],
};

export const USER_ROLES = [
  { value: 'Founder or leadership team', label: 'Руководитель команды' },
  { value: 'Product manager', label: 'Менеджер' },
  { value: 'Designer', label: 'Дизайнер' },
  { value: 'Software developer', label: 'Разработчик' },
  { value: 'Freelancer', label: 'Сторонний специалист' },
  { value: 'Other', label: 'Другое' },
];

export const ROLES = [
  { value: 5, label: 'Гость', dataId: 'role-guest' },
  { value: 10, label: 'Участник', dataId: 'role-member' },
  { value: 15, label: 'Администратор', dataId: 'role-admin' },
];

export const ALTCHA_RUS = {
  error: 'Проверка провалилась. Попробуйте позже.',
  footer: '',
  label: 'Я не робот',
  verified: 'Проверено',
  verifying: 'Проверка...',
  waitAlert: 'Проверка... пожалуйста подождите.',
};

export const DEFAULT_COLUMNS = [
  {
    style: 'width: 10px',
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    field: (row: any) => {
      return `${row.project_detail.identifier}-${row.sequence_id}`;
    },
    sortable: true,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Название',
    field: (row: any) => {
      return `${row.name}`;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority || 'Нет';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state;
    },
    sortable: true,
  },
  {
    name: 'target_date',
    align: 'left',
    label: 'Дата завершения',
    field: (row: any) => {
      return row.target_date ? formatDate(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'sub_issues_count',
    align: 'center',
    label: 'Подзадачи',
    field: (row: any) => {
      return row.sub_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'linked_issues_count',
    align: 'center',
    label: 'Связи',
    field: (row: any) => {
      return row.linked_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'link_count',
    align: 'center',
    label: 'Ссылки',
    field: (row: any) => {
      return row.link_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'attachment_count',
    align: 'center',
    label: 'Вложения',
    field: (row: any) => {
      return row.attachment_count;
    },
    sortable: true,
  },
];

export const DEFAULT_TRANSFER_MODEL = {
  target_project: '',
  linked_issues: false,
  delete_src: false,
};

export const DEFAULT_LABEL = {
  name: '',
  color: () => {
    return STATES_COLORS[Math.floor(Math.random() * STATES_COLORS.length)];
  },
};

export const DEFAULT_PROJECT = {
  cover_image: '',
  created_at: '',
  created_by: '',
  default_assignee: undefined,

  default_assignee_detail: undefined,
  default_watcher: undefined,
  default_watcher_detail: undefined,
  description: '',
  description_html: '',
  description_text: '',
  emoji: undefined,
  estimate: undefined,
  id: '',
  identifier: '',
  is_favorite: false,
  name: '',
  public: undefined,
  project_lead: '',
  project_lead_detail: undefined,
  rules_script: undefined,
  total_members: 0,
  updated_at: '',
  updated_by: undefined,
  workspace: '',
  workspace_detail: undefined,
};

export const DEF_ROWS_PER_PAGE = 25;

export const ISSUE_AUTO_SAVE = [
  { label: 'Автосохранение включено', value: true },
  { label: 'Автосохранение выключено', value: false },
];

export const EXTENSION_VIDEO = ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'];
export const EXTENSION_AUDIO = ['wav', 'aiff', 'ape', 'flac', 'mp3', 'ogg'];

export const EXTENSION_DOCUMENT = ['pdf'];

export const EXTENSION_IFRAME = ['html', 'htm'];

export const NOT_VALID_UID = '00000000-0000-0000-0000-000000000000';

export const TURN_ON_OFF = [
  {
    value: 'enable',
    label: 'Вкл',
  },
  {
    value: 'disable',
    label: 'Выкл',
  },
];

export const QUESTION_TYPE_FIELD_OPTIONS = [
  {
    label: 'Короткий ответ',
    type: 'input',
  },
  {
    label: 'Развёрнутый ответ',
    type: 'textarea',
  },
  {
    label: 'Флаг',
    type: 'checkbox',
  },
  {
    label: 'Число',
    type: 'numeric',
  },
  {
    label: 'Цвет',
    type: 'color',
  },
  {
    label: 'Дата',
    type: 'date',
  },
  {
    label: 'Раскрывающийся список',
    type: 'select',
  },
  {
    label: 'Раскрывающийся список',
    type: 'multiselect',
  },
];

export const TIMEZONES = [
  { value: 'Europe/London', label: '±00:00 Лондон, Лиссабон, Рейкьявик' },
  { value: 'Europe/Berlin', label: '+1:00 Берлин, Париж, Рим' },
  { value: 'Europe/Kaliningrad', label: '+2:00 Калининград, Вильнюс, Киев' },
  { value: 'Europe/Moscow', label: '+3:00 Москва, Санкт-Петербург, Минск' },
  { value: 'Europe/Samara', label: '+4:00 Самара, Ижевск, Баку' },
  {
    value: 'Asia/Yekaterinburg',
    label: '+5:00 Екатеринбург, Челябинск, Исламабад',
  },
  { value: 'Asia/Omsk', label: '+6:00 Омск, Алматы, Дакка' },
  {
    value: 'Asia/Krasnoyarsk',
    label: '+7:00 Красноярск, Новосибирск, Бангкок',
  },
  { value: 'Asia/Irkutsk', label: '+8:00 Иркутск, Пекин, Сингапур' },
  { value: 'Asia/Yakutsk', label: '+9:00 Якутск, Токио, Сеул' },
  { value: 'Asia/Vladivostok', label: '+10:00 Владивосток, Хабаровск, Сидней' },
  { value: 'Asia/Magadan', label: '+11:00 Магадан, Сахалин, Хониара' },
  {
    value: 'Asia/Kamchatka',
    label: '+12:00 Петропавловск-Камчатский, Окленд, Фиджи',
  },
  { value: 'Pacific/Apia', label: '+13:00 Апиа, Нукуалофа' },
  { value: 'Pacific/Kiritimati', label: '+14:00 Остров Киритимати' },
  { value: 'Atlantic/Azores', label: '-1:00 Азорские острова, Кабо-Верде' },
  {
    value: 'Atlantic/South_Georgia',
    label: '-2:00 Южная Георгия, Гренландия (Итокортоормиит)',
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    label: '-3:00 Буэнос-Айрес, Сан-Паулу, Рио-де-Жанейро',
  },
  { value: 'America/Santiago', label: '-4:00 Сантьяго, Каракас, Ла-Пас' },
  { value: 'America/New_York', label: '-5:00 Нью-Йорк, Торонто, Гавана' },
  { value: 'America/Chicago', label: '-6:00 Чикаго, Мехико, Сан-Хосе' },
  { value: 'America/Denver', label: '-7:00 Денвер, Феникс, Эдмонтон' },
  {
    value: 'America/Los_Angeles',
    label: '-8:00 Лос-Анджелес, Ванкувер, Тихий океан',
  },
  { value: 'America/Anchorage', label: '-9:00 Аляска (Анкоридж), Гамбье' },
  {
    value: 'Pacific/Honolulu',
    label: '-10:00 Гавайи, Алеутские острова, Таити',
  },
  { value: 'Pacific/Pago_Pago', label: '-11:00 Паго-Паго, Ниуэ, Мидуэй' },
  { value: 'Etc/GMT-12', label: '-12:00 Острова Бейкер и Хауленд' },
];
