import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getRoleText } from '../../activity-value.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderDocProperty = (
  property: 'описание' | 'название',
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(`изменил(-а) ${property} документа`),
      ...createCurrentDocParts(activity, context),
    );

const renderDocRole = (
  role: 'чтения' | 'редактирования',
): ActivityRenderer =>
  (activity, context) =>
    createActivityMessage(
      createTextPart(`изменил(-а) роль ${role} документа`),
      ...createCurrentDocParts(activity, context),
      createTextPart(
        ` с "${getRoleText(activity.old_value)}" на "${getRoleText(
          activity.new_value,
        )}"`,
      ),
    );

export const renderDocDescription = renderDocProperty('описание');
export const renderDocTitle = renderDocProperty('название');
export const renderDocReaderRole = renderDocRole('чтения');
export const renderDocEditorRole = renderDocRole('редактирования');

export const renderDocSort: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('отсортировал(-а) список дочерних документов в документе'),
    ...createCurrentDocParts(activity, context),
  );
