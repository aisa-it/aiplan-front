import type ru from './ru';

// Dictionary for workspace events (namespace workspaceActivity).
export default {
  properties: { avatar: 'the avatar', token: 'the token', description: 'the description' },
  nameChanged: 'the workspace name from "{previous}" to "{next}"',
  ownerTarget: 'the owner',
  fromToQuoted: 'from "{previous}" to "{next}"',
  fromToPlain: 'from {previous} to {next}',
  docTarget: 'the document ',
  childDocTarget: 'the child document ',
  toRootFolder: ' to the root folder',
  fromRootFolder: ' from the root folder',
  sortedRootDocs: 'sorted the list of root documents',
  member: 'the user {name}',
  memberWithRole: 'the user {name} with the role "{role}"',
  roleTarget: 'the role of user {name}',
  projectTarget: 'the project ',
  integrationTarget: 'the integration {value}',
  sprintTarget: 'the sprint ',
  sprintFolderTarget: 'the sprint folder "{value}"',
  sprintFolderNameChanged: 'changed the sprint folder name from "{previous}" to "{next}"',
} satisfies typeof ru;
