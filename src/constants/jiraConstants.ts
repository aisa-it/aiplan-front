const JIRA_SAVE_DB = 'Сохранение в БД';
const JIRA_TRANSfERRING_USERS = 'Перенос пользователей';
const JIRA_IMPORT_ISSUES = 'Импорт задач';
const JIRA_ATTACHMENTS = 'Перенос вложений';
const JIRA_FETCH_ISSUES = 'Получение задач'

const STAGE = {
  'db': JIRA_SAVE_DB,
  'users': JIRA_TRANSfERRING_USERS,
  'issues': JIRA_IMPORT_ISSUES,
  'attachments': JIRA_ATTACHMENTS,
  'fetch': JIRA_FETCH_ISSUES
};

export const defineStage = (stage: string): string => {
  return STAGE[stage as keyof typeof STAGE];
};
