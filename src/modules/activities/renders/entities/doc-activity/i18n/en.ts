import type ru from './ru';

export default {
  fields: { description: 'description', title: 'title' },
  changedField: 'changed the {target} of the document',
  roles: { read: 'read', edit: 'edit' },
  roleChanged: 'changed the {target} role of the document',
  fromToQuoted: 'from "{previous}" to "{next}"',
  sortedChildDocs: 'sorted the list of child documents in the document',
  docTarget: 'the document',
  rootFolderFrom: 'the root folder',
  rootFolderTo: 'the root folder',
  moveFrom: ' from ',
  moveTo: ' to ',
  childDoc: 'the child document',
  removedFromDoc: ' from the document',
  addedToDoc: ' to the document',
  attachmentAdded: 'added the attachment {value} to the document',
  attachmentDeleted: 'deleted the attachment {value} in the document',
  commentAdded: 'added a comment in the document',
  commentUpdated: 'updated a comment in the document',
  commentDeleted: 'deleted a comment in the document',
  members: {
    watcher: { added: 'added the watcher', removed: 'removed the watcher' },
  },
  permissions: {
    view: {
      added: 'granted the view permission to the user',
      removed: 'revoked the view permission from the user',
    },
    edit: {
      added: 'granted the edit permission to the user',
      removed: 'revoked the edit permission from the user',
    },
  },
  memberRelations: {
    watcher: { added: ' to the document', removed: ' from the document' },
    reader: { added: ' in the document', removed: ' in the document' },
    editor: { added: ' in the document', removed: ' in the document' },
  },
} satisfies typeof ru;
