import type ru from './ru';

export default {
  skip: 'Skip',
  t1: {
    welcome: {
      title: 'Welcome to AIPlan! 🚀',
      text: 'This is your new assistant for teamwork and task management. Want to take 2 minutes to see how everything works here?',
      action: 'Yes, sure!',
    },
    fastNavigation: {
      title: 'Fast navigation',
      text: 'Switch between workspaces, task lists and documents in one click.',
      action: 'Next',
    },
    sidebar: {
      title: 'Everything at hand',
      text: 'Your projects live here. You can also create forms, start calls, check the guide or contact us right from here.',
      action: 'Got it',
    },
    profile: {
      title: 'Everything for your convenience',
      text: 'Set up your account, appearance (for example, the dark theme) and notifications the way that suits you.',
      action: 'Okay',
    },
    createIssue: {
      title: 'Create tasks in one click!',
      text: 'See this big button? It helps you instantly add a new task without losing focus on your work.',
      action: 'Convenient!',
    },
    search: {
      title: 'Find anything in seconds',
      text: 'Lost a task or a document? Global search with filters will find everything instantly!',
      action: 'Great!',
    },
    notifications: {
      title: 'Stay in the loop',
      text: 'All important notifications from the system and your team will be here. You won’t miss a thing!',
      action: 'Clear',
    },
    conference: {
      title: 'Meetings without hassle',
      text: 'Video calls! Create your own meeting room.',
      action: 'Nice!',
    },
  },
  t2: {
    issueTable: {
      title: 'Your task management center',
      text: 'All tasks of your project live here. Want to hear about the task list capabilities?',
      action: 'I’d like to hear!',
    },
    filters: {
      title: 'Customize the view for yourself',
      text: 'Click here to turn the standard list into the perfect tool for you.',
      action: 'Show settings',
    },
    viewOptions: {
      title: 'How do you prefer to see tasks?',
      text: 'Switch between list (for details) and board (Kanban, for a visual flow).',
      action: 'Next',
    },
    columns: {
      title: 'Keep only what matters',
      text: 'Decide which data to see (status, priority, assignee). Hide the extra and reorder columns.',
      action: 'Got it',
    },
    grouping: {
      title: 'Order tasks by meaning',
      text: 'Automatically sort tasks by status, assignee, deadline or any other attribute.',
      action: 'Nice',
    },
    statusFocus: {
      title: 'Focus on the right stage',
      text: 'Show only “In progress” or hide “Done”. Keep only current tasks in sight',
      action: 'Clear',
    },
    fineTuning: {
      title: 'Fine tuning',
      items: [
        'Hide subtasks: Remove small steps from the general list to see only the main goals.',
        'Drafts: Show or hide unpublished tasks.',
        'Empty groups: Decide whether to see groups that have no tasks yet.',
      ],
      action: 'Continue',
    },
    personalFocus: {
      title: 'Personal focus',
      items: [
        'Active only: Instantly hide everything completed and cancelled.',
        'My tasks (3 toggles): In one click, keep only the tasks where you are the assignee, watcher or author.',
      ],
      action: 'Convenient!',
    },
    refresh: {
      title: 'Don’t be afraid to experiment!',
      text: 'Confused by the settings? Just press this button to return the task view to its default state.',
      action: 'All clear, let’s start!',
    },
  },
} satisfies typeof ru;
