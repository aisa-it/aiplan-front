import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityUserName } from '../../activity-value.helpers';
import { createCurrentDocParts } from './doc-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

type DocMemberAction = 'added' | 'removed';
type DocMemberKind = 'watcher' | 'reader' | 'editor';

const MEMBER_TEXT_KEY: Readonly<
  Record<DocMemberKind, Record<DocMemberAction, MessageKey>>
> = {
  watcher: {
    added: 'activities.doc.members.watcher.added',
    removed: 'activities.doc.members.watcher.removed',
  },
  reader: {
    added: 'activities.doc.permissions.view.added',
    removed: 'activities.doc.permissions.view.removed',
  },
  editor: {
    added: 'activities.doc.permissions.edit.added',
    removed: 'activities.doc.permissions.edit.removed',
  },
};

const MEMBER_RELATION_KEY: Readonly<
  Record<DocMemberKind, Record<DocMemberAction, MessageKey>>
> = {
  watcher: {
    added: 'activities.doc.memberRelations.watcher.added',
    removed: 'activities.doc.memberRelations.watcher.removed',
  },
  reader: {
    added: 'activities.doc.memberRelations.reader.added',
    removed: 'activities.doc.memberRelations.reader.removed',
  },
  editor: {
    added: 'activities.doc.memberRelations.editor.added',
    removed: 'activities.doc.memberRelations.editor.removed',
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
        `${i18n.global.t(MEMBER_TEXT_KEY[kind][action])} ${getActivityUserName(
          detail,
          fallback,
        )}${i18n.global.t(MEMBER_RELATION_KEY[kind][action])}`,
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
