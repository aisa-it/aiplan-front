// Root dictionary of the activities module: feed-wide parts (verbs, roles,
// workspace relations, list UI, fallback). Per-entity event texts live in their
// own dictionaries next to the renderers: renders/entities/<entity>/i18n.
import type ru from './ru';

export default {
  verbs: {
    updated: 'updated',
    removed: 'removed',
    added: 'added',
    deleted: 'deleted',
    created: 'created',
    move: 'moved',
    copied: 'copied',
    move_doc_to_workspace: 'moved',
    move_doc_to_doc: 'moved',
    move_workspace_to_doc: 'moved',
  },
  roles: { guest: 'Guest', member: 'Member', admin: 'Admin', forbid: 'No one' },
  fallback: 'performed an unhandled action {entity}, {field}, {verb}',
  root: { space: ' the workspace ', spaceQuoted: ' the workspace "{name}"' },
  form: {
    actions: { title: 'the form title', description: 'the form description', end_date: 'the form end date', fields: 'the form fields' },
    defaultTarget: 'the form',
    fallbackVerb: 'updated',
  },
  // Ключ 'at' нельзя: PickupPaths из vue-i18n отбрасывает имена методов массивов (Array.prototype.at)
  workspaceRelations: { inside: 'in workspace ', from: 'from workspace ', in: 'to workspace ', of: 'of workspace ' },
  workspaceRelationsShort: { from: 'from workspace', of: 'of workspace' },
  ui: { title: 'Activity', titleWithDate: 'Activity for {date}', closeDay: 'Close activities for the selected day', noData: 'No data', bot: 'Bot' },
} satisfies typeof ru;
