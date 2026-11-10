import type ru from './ru';

export default {
  fields: { name: 'name', description: 'description' },
  changedField: 'changed the {target} in sprint ',
  dates: { start: 'start', end: 'end' },
  dateChanged: 'changed the {target} date of sprint ',
  relations: { to: 'to sprint ', from: 'from sprint ' },
  issueTarget: ' the task ',
  watcherTarget: 'the watcher',
  folderChanged: 'changed the sprint folder ',
  fromToQuoted: 'from "{previous}" to "{next}"',
  noFolder: 'No folder',
} satisfies typeof ru;
