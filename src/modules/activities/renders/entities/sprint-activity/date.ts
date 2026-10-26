import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderSprintDate = (target: string): ActivityRenderer => {
  return (activity) =>
    createActivityMessage(
      createTextPart(`изменил(-а) дату ${target} спринта `),
      createSprintLink(activity),
    );
};

export const renderSprintStartDate = renderSprintDate('начала');

export const renderSprintEndDate = renderSprintDate('конца');
