import type ru from './ru';

export default {
  ws: {
    createTitle: 'Create workspace',
    nameLabel: 'Enter workspace name',
    urlLabel: 'Workspace URL',
    urlTaken: 'This URL is already taken',
    validation: {
      nameMin: 'Name must contain 3 or more characters',
      slugMin: 'Identifier must contain 3 or more characters',
      slugKebab: 'Only lowercase Latin letters, digits and hyphens are allowed',
      slugRestricted: 'Reserved system workspace name',
    },
  },
  project: {
    createTitle: 'Create new project',
    nameLabel: 'Enter project name',
    identifierLabel: 'Enter project identifier',
    visibility: { hidden: 'Hidden', public: 'Public' },
    validation: {
      nameMin: 'Name must contain 1 or more characters',
      identifierMin: 'Identifier must contain {min} or more characters',
    },
  },
  closeConfirm: {
    wsTitle: 'Close workspace creation',
    projectTitle: 'Close project creation',
    body: 'Are you sure you want to close the window? All entered data will be lost.',
    back: 'Go back',
  },
} satisfies typeof ru;
