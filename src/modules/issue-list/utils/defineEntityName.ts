import { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { translateFirstCharUpperCasePriority } from 'src/utils/translator';

function userName(user: DtoUser) {
  return aiplan.UserName(user).join(' ');
}

export function defineEntityName(entity: any, groupBy: string) {
  switch (groupBy) {
    case 'state': {
      return entity.name;
    }
    case 'labels': {
      return entity ? entity.name : 'Без тегов';
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
