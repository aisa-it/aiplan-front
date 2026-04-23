import { HistoryEntry } from '../types';

function createDocLink(entity_detail: any, workspace_detail: {name: string, slug?: string} |undefined, fallback: string = '') {
    if (!entity_detail) return fallback;

    return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${`/${workspace_detail?.slug}/aidoc/${entity_detail.id}`}>
                    "${entity_detail.title}"<a/>`;
  }

export function renderDoc(m: HistoryEntry): string | undefined {
  switch (m.verb) {
    case 'removed':
    case 'remove':
      return `убрал(-а) дочерний документ ${createDocLink(
        m.old_entity_detail, m.workspace_detail,
        m.old_value ?? ''
      )}`;
    case 'added':
    case 'add':
      return `добавил(-а) дочерний документ ${createDocLink(
        m.new_entity_detail, m.workspace_detail,
        m.new_value ?? ''
      )}`;
    case 'created':
      return `создал(-а) дочерний документ ${createDocLink(
        m.new_entity_detail, m.workspace_detail,
        m.new_value ?? ''
      )}`;
    case 'deleted':
      return `удалил(-а) дочерний документ ${createDocLink(
        m.old_entity_detail,
        m.workspace_detail,
        m.old_value ?? ''
      )}`;
    case 'move_workspace_to_doc':
    case 'move_doc_to_workspace':
    case 'move_doc_to_doc':
    case 'move':
      return `перенес(-ла) документ из ${
            m.old_value === m.workspace_detail?.name
              ? 'корневой папки'
              : createDocLink(
                  m.old_entity_detail,
                  m.workspace_detail,
                  m.old_value ?? '',
                )
          } в ${
            m.new_value === m.workspace_detail?.name
              ? 'корневую папку'
              : createDocLink(
                  m.new_entity_detail,
                  m.workspace_detail,
                  m.new_value ?? '',
                )
          }`;
    default:
      break;
    }
  return undefined;
}

export function renderSeqId(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated') {
    return `изменил(-а) позицию документа в директории с ${+m.old_value! + 1} на ${+m.new_value! + 1}`;
  }
  if (m.verb === 'move') {
    if (m.new_value === m.workspace_detail?.name) {
      return 'перенес(-ла) документ в корневую директорию';
    } else {
      return `перенес(-ла) документ в директорию "${m.new_value}"`;
    }
  }
  return undefined;
}

export function renderTitle(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated' && m.entity_type === 'doc') {
    return 'изменил(-а) название документа';
  }
  return undefined;
}

export function renderDescription(m: HistoryEntry): string | undefined {
  if (m.verb === 'updated' && m.entity_type === 'doc') {
    return 'изменил(-а) описание документа';
  }
  return undefined;
}

export function renderDocSort(m: HistoryEntry): string | undefined {
  return '<span>отсортировал(-а) список дочерних документов';
}
