import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityUserName } from '../../activity-value.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

type DocMemberAction = 'added' | 'removed';
type DocMemberKind = 'watcher' | 'reader' | 'editor';

const MEMBER_TEXT: Readonly<
  Record<DocMemberKind, Record<DocMemberAction, string>>
> = {
  watcher: {
    added: 'добавил(-а) наблюдателя',
    removed: 'убрал(-а) наблюдателя',
  },
  reader: {
    added: 'добавил(-а) право на просмотр пользователю',
    removed: 'удалил(-а) право на просмотр пользователю',
  },
  editor: {
    added: 'добавил(-а) право на редактирование пользователю',
    removed: 'удалил(-а) право на редактирование пользователю',
  },
};

const MEMBER_RELATION_TEXT: Readonly<
  Record<DocMemberKind, Record<DocMemberAction, string>>
> = {
  watcher: {
    added: ' в документ',
    removed: ' из документа',
  },
  reader: {
    added: ' в документе',
    removed: ' в документе',
  },
  editor: {
    added: ' в документе',
    removed: ' в документе',
  },
};

const renderDocMember = (
  kind: DocMemberKind,
  action: DocMemberAction,
): ActivityRenderer =>
  (activity, context) => {
    const isAdded = action === 'added';
    const detail = isAdded
      ? activity.new_entity_detail
      : activity.old_entity_detail;
    const fallback = isAdded ? activity.new_value : activity.old_value;

    return createActivityMessage(
      createTextPart(
        `${MEMBER_TEXT[kind][action]} ${getActivityUserName(
          detail,
          fallback,
        )}${MEMBER_RELATION_TEXT[kind][action]}`,
      ),
      ...createCurrentDocParts(activity, context),
    );
  };

export const renderDocWatcherAdded = renderDocMember('watcher', 'added');
export const renderDocWatcherRemoved = renderDocMember('watcher', 'removed');
export const renderDocReaderAdded = renderDocMember('reader', 'added');
export const renderDocReaderRemoved = renderDocMember('reader', 'removed');
export const renderDocEditorAdded = renderDocMember('editor', 'added');
export const renderDocEditorRemoved = renderDocMember('editor', 'removed');
