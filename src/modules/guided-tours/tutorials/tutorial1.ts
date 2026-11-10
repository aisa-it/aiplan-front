import { type Step } from '../types/step';

export const STEP_NUM = 1;

export const steps: Step[] = [
  {
    el: '',
    titleKey: 'guidedTours.t1.welcome.title',
    textKey: 'guidedTours.t1.welcome.text',
    activeButtonTextKey: 'guidedTours.t1.welcome.action',
    is_skip: true,
    placement: {
      mode: 'screen',
      primary: 'center',
      align: 'center',
    },
  },
  {
    el: '[data-tour="fast-navigation"]',
    titleKey: 'guidedTours.t1.fastNavigation.title',
    textKey: 'guidedTours.t1.fastNavigation.text',
    activeButtonTextKey: 'guidedTours.t1.fastNavigation.action',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'start',
    },
  },
  {
    el: '[data-tour="sidebar"]',
    titleKey: 'guidedTours.t1.sidebar.title',
    textKey: 'guidedTours.t1.sidebar.text',
    activeButtonTextKey: 'guidedTours.t1.sidebar.action',
    placement: {
      mode: 'outside',
      primary: 'right',
      align: 'center',
    },
  },
  {
    el: '[data-tour="profile"]',
    titleKey: 'guidedTours.t1.profile.title',
    textKey: 'guidedTours.t1.profile.text',
    activeButtonTextKey: 'guidedTours.t1.profile.action',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="create-issue"]',
    titleKey: 'guidedTours.t1.createIssue.title',
    textKey: 'guidedTours.t1.createIssue.text',
    activeButtonTextKey: 'guidedTours.t1.createIssue.action',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="search"]',
    titleKey: 'guidedTours.t1.search.title',
    textKey: 'guidedTours.t1.search.text',
    activeButtonTextKey: 'guidedTours.t1.search.action',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="notifications"]',
    titleKey: 'guidedTours.t1.notifications.title',
    textKey: 'guidedTours.t1.notifications.text',
    activeButtonTextKey: 'guidedTours.t1.notifications.action',
    padding: 4,
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="conference"]',
    titleKey: 'guidedTours.t1.conference.title',
    textKey: 'guidedTours.t1.conference.text',
    activeButtonTextKey: 'guidedTours.t1.conference.action',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
];
