import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderSprintProperty = (target: string): ActivityRenderer => {
  return (activity) =>
    createActivityMessage(
      createTextPart(`изменил(-а) ${target} в спринте `),
      createSprintLink(activity),
    );
};

export const renderSprintName = renderSprintProperty('название');

export const renderSprintDescription = renderSprintProperty('описание');
