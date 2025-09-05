export const translateVerb = (word: string) => {
  switch (word) {
    case 'created':
      return 'добавил(-a)';
    case 'deleted':
      return 'убрал(-а)';
    case 'remove':
    case 'removed':
      return 'убрал(-а)';
    case 'added':
      return 'добавил(-а)';
    case 'updated':
      return 'обновил(-a)';
    default:
      return word;
  }
};
export const translatePrioritets = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'критический';
    case 'high':
      return 'высокий';
    case 'medium':
      return 'средний';
    case 'low':
      return 'низкий';
    case 'null':
      return 'не выбран';
    case 'none':
      return 'не выбран';
    case '<nil>':
      return 'не выбран';
    default:
      return priority;
  }
};

export const stateRUS = (val: string) => {
  switch (val.toLowerCase()) {
    case 'backlog':
      return 'Открыто';
    case 'unstarted':
      return 'Не начато';
    case 'started':
      return 'Начато';
    case 'completed':
      return 'Завершено';
    case 'cancelled':
      return 'Отменено';
    default:
      return val;
  }
};

import { storeToRefs } from 'pinia';

import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import aiplan from 'src/utils/aiplan';

const statesStore = useStatesStore();
const workspaceStore = useWorkspaceStore();

const { statesCache } = storeToRefs(statesStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

export const logsRUS = (val: string, error?: [], target_project?: string) => {
  const projectStore = useProjectStore();
  const { project, currentProjectID, projectLabels, projectMembers } =
    storeToRefs(projectStore);
  // это херня какая-то - по-хорошему надо с бека перевод адекватный получать
  const translatedNames: any = [];

  switch (error?.type) {
    case 'state':
      error.entities.forEach((el: any) => {
        translatedNames.push(
          statesCache.value[
            project.value.id as keyof typeof statesCache.value
          ]?.find((state) => state.id === el)?.name,
        );
      });
      break;
    case 'label':
      error.entities.forEach((el: any) => {
        translatedNames.push(
          projectLabels.value?.find((l: any) => l.id === el)?.name,
        );
      });
      break;
    case 'user':
      error.entities.forEach((el: any) => {
        translatedNames.push(
          aiplan
            .UserName(
              projectMembers.value?.find((l) => l.member_id === el)?.member,
            )
            .join(' '),
        );
      });
      break;
  }

  switch (val) {
    case 'target project not found':
      return `Проект <b>${target_project}<b/> не найден`;
    case 'issue not found':
      return `Задача <b>${project.value.identifier}-${error?.issue_sequence_id}<b/> не найдена`;
    case 'issues with conflicted names':
      return `Имя задачи <b>${project.value.identifier}-${error?.issue_sequence_id}<b/> уже существует`;
    case 'label not found':
      return `Тег ${translatedNames ?? ''} не найден`;
    case 'source author not a target project member':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - автор задачи <b>${
        translatedNames ?? ''
      }<b/> не является участником проекта <b>${target_project}<b/>`;
    case 'you are not a target project member':
      return 'Вы – не участник проекта для переноса';
    case 'source assignees that not a members of target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - исполнитель <b>${
        translatedNames ?? ''
      }</b> не является участником проекта <b>${target_project}<b/>`;
    case 'source watchers that not a members of target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - наблюдатель <b>${
        translatedNames ?? ''
      }</b> не является участником проекта <b>${target_project}<b/>`;
    case 'source state that does not exist in target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - статус <b>"${
        translatedNames ?? ''
      }"</b> отсутствует в проекте <b>${target_project}<b/>`;
    case 'source labels that does not exist in target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - ${
        translatedNames?.length > 1 ? 'теги' : 'тег'
      } <b>"${translatedNames.join(', ') ?? ''}"</b>  ${
        translatedNames?.length > 1 ? 'отсутствуют' : 'отсутствует'
      } в проекте <b>${target_project}</b>. Проверьте, что в конечном проекте ${
        translatedNames?.length > 1 ? 'присутствуют теги' : 'присутствует тег'
      }   с таким же названием и цветом`;
    case 'issue assignment is not allowed for assignee with current role of target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - исполнитель <b>${
        translatedNames ?? ''
      }</b> имеет недостаточную роль для выполнения задачи в целевом проекте <b>${target_project}<b/>`;

    case 'issue watching is not allowed for watcher with current role of target project':
      return `<a style="color: inherit !important; text-decoration: none; font-weight: 600;" target="_blank" href=${`/${currentWorkspaceSlug.value}/projects/${currentProjectID.value}/issues/${error?.issue_sequence_id}`}>${
        project.value.identifier
      }-${error?.issue_sequence_id}</a> - наблюдатель <b>${
        translatedNames ?? ''
      }</b> имеет недостаточную роль для просмотра задачи в целевом проекте <b>${target_project}<b/>`;

    default:
      return val;
  }
};
