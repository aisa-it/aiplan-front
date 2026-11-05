import type { Step } from '../types/step';
import { useGuiderStore } from '../guider-store';

export const STEP_NUM = 2;

export const steps: Step[] = [
  {
    el: '[data-tour="issue-table"]',
    titleKey: 'guidedTours.t2.issueTable.title',
    textKey: 'guidedTours.t2.issueTable.text',
    activeButtonTextKey: 'guidedTours.t2.issueTable.action',
    is_skip: true,
    isOffScroll: true,
    placement: {
      mode: 'inside',
      primary: 'left',
      align: 'end',
      offset: {
        x: 16,
        y: -16,
      },
    },
  },
  {
    el: '[data-tour="filter-list"]',
    titleKey: 'guidedTours.t2.filters.title',
    textKey: 'guidedTours.t2.filters.text',
    activeButtonTextKey: 'guidedTours.t2.filters.action',
    padding: 8,
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'start',
    },
  },
  {
    el: '[data-tour="view-options"]',
    titleKey: 'guidedTours.t2.viewOptions.title',
    textKey: 'guidedTours.t2.viewOptions.text',
    activeButtonTextKey: 'guidedTours.t2.viewOptions.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
    onEnter: () => {
      useGuiderStore().openFiltersList();
    },
  },
  {
    el: '[data-tour="columns-options"]',
    titleKey: 'guidedTours.t2.columns.title',
    textKey: 'guidedTours.t2.columns.text',
    activeButtonTextKey: 'guidedTours.t2.columns.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="group-options"]',
    titleKey: 'guidedTours.t2.grouping.title',
    textKey: 'guidedTours.t2.grouping.text',
    activeButtonTextKey: 'guidedTours.t2.grouping.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="status-options"]',
    titleKey: 'guidedTours.t2.statusFocus.title',
    textKey: 'guidedTours.t2.statusFocus.text',
    activeButtonTextKey: 'guidedTours.t2.statusFocus.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="task-general-settings"]',
    titleKey: 'guidedTours.t2.fineTuning.title',
    textListKeys: [
      'guidedTours.t2.fineTuning.items[0]',
      'guidedTours.t2.fineTuning.items[1]',
      'guidedTours.t2.fineTuning.items[2]',
    ],
    activeButtonTextKey: 'guidedTours.t2.fineTuning.action',
    padding: 4,
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="task-personal-settings"]',
    titleKey: 'guidedTours.t2.personalFocus.title',
    textListKeys: [
      'guidedTours.t2.personalFocus.items[0]',
      'guidedTours.t2.personalFocus.items[1]',
    ],
    activeButtonTextKey: 'guidedTours.t2.personalFocus.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="refresh-filters"]',
    titleKey: 'guidedTours.t2.refresh.title',
    textKey: 'guidedTours.t2.refresh.text',
    activeButtonTextKey: 'guidedTours.t2.refresh.action',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'start',
    },
    onLeave: () => {
      useGuiderStore().closeFiltersList();
    },
  },
];
