import type ru from './ru';

export default {
  title: 'Profile settings',
  tabs: {
    general: 'General',
    activities: 'Activities',
    design: 'Appearance',
  },
  avatar: {
    description: 'Supports .jpg, .png and .gif up to 20 MB.',
    dialogTitle: 'Upload avatar (up to 20 MB)',
    dropActive: 'Drop the file here...',
    dropIdle: 'Drag and drop or click to select a file',
    errorTitle: 'An error occurred while uploading',
    errorHint:
      'Make sure you are uploading a JPEG, GIF or PNG file and try again.',
    errorHintWithLimit:
      'Make sure you are uploading a JPEG, GIF or PNG file up to 20 MB and try again.',
  },
  data: {
    fullName: {
      description: 'Your first and last name',
      firstNameLabel: 'Enter first name',
      lastNameLabel: 'Enter last name',
    },
    email: {
      description: 'Your email address',
      label: 'Enter email',
    },
    username: {
      description: 'Your username in the system',
      label: 'Enter username',
    },
    telegramId: {
      description:
        'Your Telegram ID for receiving notifications. Message the {bot} to get your ID',
      bot: 'bot',
      label: 'Enter Telegram ID',
    },
    timezone: {
      description: 'Your time zone for displaying time in notifications',
      label: 'Your time zone',
    },
    token: {
      description: 'Authorization token',
      reset: 'Reset token',
      copy: 'Copy token',
    },
  },
  password: {
    heading: 'Change password',
    new: {
      title: 'New password',
      description: 'Enter a new password',
    },
    repeat: {
      title: 'Confirm new password',
      description: 'Enter the new password again',
    },
    label: 'Enter password',
    submit: 'Change password',
  },
  notifications: {
    heading: 'Notification settings',
    description:
      'Deactivating an option blocks all notifications of this type, including project settings.',
    channels: {
      app: 'In-app',
    },
    channelAria: 'Notifications: {channel}',
    deadlineDescription:
      'Choose how long before a task deadline you want to receive a notification',
    deadline: {
      hours: '{n} hour | {n} hours',
      days: '{n} day | {n} days',
    },
  },
  activities: {
    empty: 'The user has no activity',
    notEnoughData: 'Not enough data to show activity by day',
  },
  design: {
    language: {
      description: 'Interface language',
    },
    theme: {
      description: 'Choose a theme',
      system: 'System',
      options: {
        dark: 'Dark',
        light: 'Light',
      },
    },
    issueOpen: {
      title: 'Issue view',
      description: 'Choose how to open issues',
      label: 'Issue view',
      options: {
        newWindow: 'In a new window',
        currentPage: 'On the current page',
      },
    },
    autoSave: {
      title: 'Autosave',
      description: 'Autosave changes in the editor',
      label: 'Autosave',
      options: {
        enabled: 'Autosave enabled',
        disabled: 'Autosave disabled',
      },
    },
    snow: {
      title: 'Snowfall',
      description: 'Snowfall in the New Year theme',
      label: 'Snowfall',
      densityLabel: 'Snowfall density',
      density: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
    },
  },
  validation: {
    required: {
      firstName: 'First name is required',
      lastName: 'Last name is required',
      username: 'Username is required',
      password: 'Password is required',
    },
    maxLength: 'Maximum length is {length} characters',
    nameCharacters: {
      firstName:
        'First name can contain Latin or Cyrillic letters and the hyphen (-) special character',
      lastName:
        'Last name can contain Latin or Cyrillic letters and the hyphen (-) special character',
    },
    containsLetter: {
      firstName:
        'First name must contain at least one letter of the Latin or Cyrillic alphabet',
      lastName:
        'Last name must contain at least one letter of the Latin or Cyrillic alphabet',
    },
    usernameCharacters:
      'Username can contain Latin letters and the special characters: period (.), underscore (_), hyphen (-), forward and back slash (/, \\), digits (0-9)',
    usernameContainsLetter: 'Username must contain at least one Latin letter',
    telegramId: 'Telegram ID can contain digits only',
    email: 'Invalid email',
    passwordsMismatch: 'Passwords do not match',
    usernameTaken: 'This username is already taken',
  },
} satisfies typeof ru;
