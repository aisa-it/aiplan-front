import type ru from './ru';

export default {
  title: 'Forms',
  noForms: 'No forms',
  loadError: 'Unable to load forms',
  copyLink: 'Copy link',
  copyError: 'Unable to copy the link',
  columns: {
    title: 'Name',
    slug: 'Identifier',
    endDate: 'End date',
    fieldsCount: 'Questions',
    link: 'Link',
  },
  deleteDialog: {
    title: 'Delete form',
    confirm: 'Are you sure you want to delete “{title}”?',
    warning: 'This action cannot be undone.',
    success: 'Form deleted',
  },
} satisfies typeof ru;
