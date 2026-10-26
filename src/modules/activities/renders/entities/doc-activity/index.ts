import { createActivityRenderer } from '../../create-activity-renderer';
import {
  renderDocAttachmentCreated,
  renderDocAttachmentDeleted,
} from './attachment';
import {
  renderDocCommentCreated,
  renderDocCommentDeleted,
  renderDocCommentUpdated,
} from './comment';
import {
  renderChildDocAdded,
  renderChildDocCreated,
  renderChildDocDeleted,
  renderChildDocRemoved,
  renderDocMoved,
} from './doc';
import {
  renderDocEditorAdded,
  renderDocEditorRemoved,
  renderDocReaderAdded,
  renderDocReaderRemoved,
  renderDocWatcherAdded,
  renderDocWatcherRemoved,
} from './member';
import {
  renderDocDescription,
  renderDocEditorRole,
  renderDocReaderRole,
  renderDocSort,
  renderDocTitle,
} from './property';

export const renderDocActivity = createActivityRenderer({
  description: renderDocDescription,
  title: renderDocTitle,
  watchers: {
    added: renderDocWatcherAdded,
    removed: renderDocWatcherRemoved,
  },
  readers: {
    added: renderDocReaderAdded,
    removed: renderDocReaderRemoved,
  },
  editors: {
    added: renderDocEditorAdded,
    removed: renderDocEditorRemoved,
  },
  reader_role: renderDocReaderRole,
  editor_role: renderDocEditorRole,
  attachment: {
    created: renderDocAttachmentCreated,
    deleted: renderDocAttachmentDeleted,
  },
  comment: {
    created: renderDocCommentCreated,
    updated: renderDocCommentUpdated,
    deleted: renderDocCommentDeleted,
  },
  doc: {
    move_workspace_to_doc: renderDocMoved,
    move_doc_to_workspace: renderDocMoved,
    move_doc_to_doc: renderDocMoved,
    move: renderDocMoved,
    deleted: renderChildDocDeleted,
    removed: renderChildDocRemoved,
    added: renderChildDocAdded,
    created: renderChildDocCreated,
  },
  doc_sort: renderDocSort,
});
