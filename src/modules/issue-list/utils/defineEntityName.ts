import { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { translateFirstCharUpperCasePriority } from 'src/utils/translator';

function userName(user: DtoUser) {
  return aiplan.UserName(user).join(' ');
}

export function defineEntityName(entity: any, groupBy: string) {
  // группировка по дополнительному параметру (property:<uuid>):
  // entity — сырое значение (строка) или null для «не заполнено»
  if (typeof groupBy === 'string' && groupBy.startsWith('property:')) {
    return entity ? String(entity) : 'Не заполнено';
  }
  switch (groupBy) {
    case 'project':
    case 'state': {
      return entity?.name;
    }
    case 'labels': {
      return entity ? entity?.name : 'Без тегов';
    }
    case 'priority': {
      return entity
        ? translateFirstCharUpperCasePriority(entity)
        : 'Без приоритета';
    }
    case 'author': {
      return userName(entity);
    }
    case 'assignees': {
      return entity ? userName(entity) : 'Без исполнителей';
    }
    case 'watchers': {
      return entity ? userName(entity) : 'Без наблюдателей';
    }
  }
  return entity;
}
