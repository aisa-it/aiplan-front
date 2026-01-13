import { HistoryEntry, HistoryRenderer } from '../types';

export const renderIssueTransfer: HistoryRenderer = (m, wsProjects) => {
  const newProject = wsProjects.find(
    (project) => project.id === (m.new_identifier || m.project_id),
  );
  const newVal = newProject
    ? `в проект "${newProject.name}"`
    : 'в скрытый/удаленный проект';
  const oldProject = wsProjects.find(
    (project) => project.id === m.old_identifier,
  );
  const oldVal = oldProject
    ? `из проекта "${oldProject.name}"`
    : 'из скрытого/удаленного проекта';

  if (m.verb === 'copied') {
    return `скопировал(-а) задачу ${oldVal}`;
  }

  if (m.verb === 'move') {
    return `перенес(-ла) задачу ${oldVal}`;
  }

  return `перенес(-ла) задачу ${oldVal} ${newVal}`;
};

export function renderProject(m: HistoryEntry): string | undefined {
  if (m.verb === 'move') {
    const newProjectName = m.project_detail?.name
      ? m.project_detail.name
      : 'в скрытый/удаленный проект';
    const oldProjectName = m.old_entity_detail?.name
      ? m.old_entity_detail.name
      : 'из скрытого/удаленного проекта';
    return `перенес(-ла) задачу из "${oldProjectName}" в "${newProjectName}"`;
  }
  return undefined;
}

