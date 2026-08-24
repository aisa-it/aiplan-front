import { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { translateFirstCharUpperCasePriority } from 'src/utils/translator';
import { PROPERTY_GROUP_BY_PREFIX } from '../composables/useGroupedIssues';
import { propertyLookupLabels, propertyTemplateTypes } from '../services/api';

function userName(user: DtoUser) {
  return aiplan.UserName(user).join(' ');
}

// бэкенд может отдать значение группы JSON-строкой (например, ссылка —
// { name, url }) — пробуем распарсить, иначе возвращаем строку как есть
function parseEntityValue(entity: any): any {
  if (typeof entity === 'string' && /^\s*[{[]/.test(entity)) {
    try {
      return JSON.parse(entity);
    } catch {
      // не JSON — оставляем строку как есть
    }
  }
  return entity;
}

export function defineEntityName(entity: any, groupBy: string) {
  // группировка по дополнительному параметру (property:<uuid>):
  // entity — сырое значение (строка) или null для «не заполнено»
  if (
    typeof groupBy === 'string' &&
    groupBy.startsWith(PROPERTY_GROUP_BY_PREFIX)
  ) {
    const templateId = groupBy.slice(PROPERTY_GROUP_BY_PREFIX.length);
    const type = propertyTemplateTypes.value[templateId];
    // «Флаг» (boolean): показываем «Выбрано»/«Не выбрано», а не true/false.
    // Тип шаблона берём из загруженных шаблонов (propertyTemplateTypes);
    // булево значение само по себе тоже говорит о флаге — другие типы
    // параметров булевых значений не дают.
    if (type === 'boolean' || typeof entity === 'boolean') {
      if (entity == null || entity === '') return 'Не заполнено';
      return entity === true || entity === 'true' ? 'Выбрано' : 'Не выбрано';
    }
    // «Ссылка»: значение — объект { name, url }, показываем только название
    if (type === 'link' && entity) {
      const linkValue = parseEntityValue(entity);
      if (linkValue && typeof linkValue === 'object') {
        return linkValue.name ? String(linkValue.name) : 'Не заполнено';
      }
      return String(linkValue);
    }
    // «Справочник» (lookup): entity — id строки справочника,
    // показываем её название (value), а не id
    if (type === 'lookup' && entity) {
      const row = parseEntityValue(entity);
      const rowId = row && typeof row === 'object' ? row.id : row;
      // название из присланного объекта или из загруженных строк справочника
      const label =
        (row && typeof row === 'object' && row.value) ||
        propertyLookupLabels.value[templateId]?.[String(rowId)];
      return label ? String(label) : String(entity);
    }
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
