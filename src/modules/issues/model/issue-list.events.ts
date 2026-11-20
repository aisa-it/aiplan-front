import type { EventBusKey } from '@vueuse/core';

import type { ProjectIssueListScope } from './issue-list.types';

export const issueCreatedEvent: EventBusKey<ProjectIssueListScope> =
  Symbol('issue-created');
