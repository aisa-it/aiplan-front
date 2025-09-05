export const THEMES = ['light', 'dark', 'visually-impaired'];

export const THEMES_OBJ = [
  {
    value: 'light',
    label: 'Светлая',
    type: 'light',
    icon: {
      border: '#DEE2E6',
      color1: '#FAFAFA',
      color2: '#474A52',
    },
  },
  {
    value: 'dark',
    label: 'Темная',
    type: 'dark',
    icon: {
      border: '#2E3234',
      color1: '#191B1B',
      color2: '#3C85D9',
    },
  },
  {
    value: 'visually-impaired',
    label: 'Для слабовидящих',
    type: 'light',
    icon: {
      border: '#DEE2E6',
      color1: '#FAFAFA',
      color2: '#474A52',
    },
  },
];

export const NEW_THEMES_OBJ = [
  {
    value: 'dark',
    label: 'Темная',
    is_dark: true,
  },
  {
    value: 'light',
    label: 'Светлая',
    is_dark: false,
  },

  // {
  //   value: 'visually-impaired',
  //   label: 'Для слабовидящих',
  //   is_dark: false,
  // },
];

export const ISSUE_OPEN = [
  { label: 'В новом окне', value: true },
  { label: 'На текущей странице', value: false },
];
