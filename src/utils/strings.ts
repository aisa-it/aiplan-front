import aiplan from 'src/utils/aiplan';
import { IProject } from 'src/interfaces/projects';
import { formatDate } from './time';
import { canBeConvertedToDate } from './canBeConvertedToDate';

export const addSpaceIfCamelCase = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, '$1 $2');

export const replaceUnderscoreIfSnakeCase = (str: string) =>
  str.replace(/_/g, ' ');

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const truncateText = (str: string, length: number) => {
  if (!str || str === '') return '';

  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const createSimilarString = (str: string) => {
  const shuffled = str
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return shuffled;
};

const fallbackCopyTextToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.body.removeChild(textArea);
};

export const copyTextToClipboard = async (text: string) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  await navigator.clipboard.writeText(text);
};

const wordsVector = (str: string) => {
  const words = str.split(' ');
  const vector: any = {};
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (vector[word]) {
      vector[word] += 1;
    } else {
      vector[word] = 1;
    }
  }
  return vector;
};

export const cosineSimilarity = (a: string, b: string) => {
  const vectorA = wordsVector(a.trim());
  const vectorB = wordsVector(b.trim());

  const vectorAKeys = Object.keys(vectorA);
  const vectorBKeys = Object.keys(vectorB);

  const union = vectorAKeys.concat(vectorBKeys);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < union.length; i++) {
    const key = union[i];
    const valueA = vectorA[key] || 0;
    const valueB = vectorB[key] || 0;
    dotProduct += valueA * valueB;
    magnitudeA += valueA * valueA;
    magnitudeB += valueB * valueB;
  }

  return dotProduct / Math.sqrt(magnitudeA * magnitudeB);
};

export const generateRandomColor = (string: string): string => {
  if (!string) return 'rgb(var(--color-accent))';

  string = `${string}`;

  const uniqueId = string.length.toString() + string; // Unique identifier based on string length
  const combinedString = uniqueId + string;

  const hash = Array.from(combinedString).reduce((acc, char) => {
    const charCode = char.charCodeAt(0);
    return (acc << 5) - acc + charCode;
  }, 0);

  const hue = hash % 360;
  const saturation = 70; // Higher saturation for pastel colors
  const lightness = 60; // Mid-range lightness for pastel colors

  const randomColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return randomColor;
};

export const getFirstCharacters = (str: string) => {
  const words = str.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0);
  } else {
    return words[0].charAt(0) + words[1].charAt(0);
  }
};

export const valToRole = (val: number) => {
  switch (val) {
    case 5:
      return { value: 5, label: 'Гость' };
    case 10:
      return { value: 10, label: 'Участник' };
    case 15:
      return { value: 15, label: 'Администратор' };
    default:
      return { value: 5, label: 'Гость' };
  }
};

export const valToNet = (val: boolean) => {
  switch (val) {
    case false:
      return { value: false, label: 'Скрытый' };
    case true:
      return { value: true, label: 'Публичный' };
    default:
      return { value: false, label: 'Скрытый' };
  }
};

export const getIcon = (name: string): string => {
  switch (name) {
    case 'deleted':
      return 'delete';
    case 'created':
      return 'add_circle_outline';
    case 'updated':
      return 'edit';
    default:
      return 'visibility';
  }
};

export const getHistoryText = (m: any, wsProjects: IProject[]) => {
  switch (m.field) {
    case 'blocks':
      if (m.old_value == null || m.old_value == '')
        return `добавил(-а) ${aiplan.ru_field(m)} ${m.new_value}`;
      if (m.new_value == '')
        return `удалил(-а) ${aiplan.ru_field(m)} ${m.old_value}`;
      return `${aiplan.ru_verb(m)}
                ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
    case 'assignees':
      if (m.old_value == null || m.old_value == '')
        return `добавил(-а) ${aiplan.ru_field(m)}
              ${aiplan.UserName(m.new_entity_detail).join(' ')}`;
      if (m.new_value == '')
        return `убрал(-а)  ${aiplan.ru_field(m)}
              ${aiplan.UserName(m.old_entity_detail).join(' ')}`;
    case 'completed_at':
      return 'завершил(-а) задачу';
    case 'start_date':
      return 'начал(-а) выполнение задачи';
    case 'watchers':
      if (m.old_value == null || m.old_value == '')
        return `добавил(-а) ${aiplan.ru_field(m)}
              ${aiplan.UserName(m.new_entity_detail).join(' ')}`;
      if (m.new_value == '')
        return `убрал(-а) ${aiplan.ru_field(m)}
              ${aiplan.UserName(m.old_entity_detail).join(' ')}`;
    case 'parent':
    case 'blocking':
      if (m.old_value == null || m.old_value == '')
        return `${aiplan
          .UserName(m.target_user)
          .join(' ')} заблокировал(-а) задачу ${m.new_value}`;
      if (m.new_value == '')
        return `${aiplan
          .UserName(m.target_user)
          .join(' ')} снял(-а) ${aiplan.ru_field(m)} с задачи ${m.old_value}`;

      return `${aiplan.ru_verb(m)}
              ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
    case 'comment':
      if (m.verb === 'created') {
        return `добавил(-а)
              ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
      }
      return `${aiplan.ru_verb(m)}
              ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
    case 'attachment':
      if (m.verb === 'created') {
        return `добавил(-а) ${aiplan.ru_field(m)} ${aiplan.ru_value(m)} "${
          m.new_entity_detail?.asset.name || m.new_value
        }"  `;
      }
      return `${aiplan.ru_verb(m)} ${aiplan.ru_field(m)} ${aiplan.ru_value(
        m,
      )} "${m.old_value}"`;
    case 'issue_transfer':
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

    case 'linked':
      if (m.verb === 'updated' && !m.new_value && m.old_value) {
        return `убрал(-а) связь с задачей ${m.old_value}`;
      }
      if (m.verb === 'updated' && !m.old_value && m.new_value) {
        return `добавил(-а) связь с задачей ${m.new_value}`;
      }

    case 'sub_issue':
      if (m.verb === 'added') {
        return `добавил(-а) подзадачу ${m.new_value}`;
      }
      if (m.verb === 'removed') {
        return `удалил(-а) подзадачу ${m.old_value}`;
      }
    case 'priority':
      if (m.verb === 'updated' && m.old_value === '<nil>') {
        return `установил(-а)
                ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
      }
      return `${aiplan.ru_verb(m)}
                ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;

    case 'labels':
      if (m.verb === 'added') {
        return `добавил(-а) тег ${m.new_value}`;
      }
      if (m.verb === 'removed') {
        return `удалил(-а) тег ${m.old_value}`;
      }
    case 'label':
      if (m.verb === 'added') {
        return `добавил(-а) тег ${m.new_value}`;
      }
      if (m.verb === 'removed') {
        return `удалил(-а) тег ${m.old_value}`;
      }
    case 'link':
      if (m.verb === 'created' && !m.old_value && m.new_value) {
        return `добавил(-а) ссылку "${
          m.new_entity_detail?.title || m.new_value
        }"`;
      }

      if (m.verb === 'deleted' && m.old_value) {
        return `удалил(-а) ссылку "${
          m.old_entity_detail?.title || m.old_value
        }"`;
      }
    case 'link_url':
      if (m.verb === 'updated' && m.new_value) {
        return `изменил(-а) ссылку c"${m.old_value}" на "${m.new_value}" `;
      }

    case 'link_title':
      return `изменил(-а) название ссылки с "${m.old_value}" на "${m.new_value}"`;
    case 'doc':
      if (m.verb === 'remove') {
        return `убрал(-а) вложенный документ "${m.old_value}"`;
      }
      if (m.verb === 'added') {
        return `добавил(-а) вложенный документ "${m.new_value}"`;
      }
      if (m.verb === 'created') {
        return `создал(-а) вложенный документ "${m.new_value}"`;
      }

    case 'seq_id':
      if (m.verb === 'updated') {
        return `изменил(-а) позицию документа в директории с ${
          +m.old_value + 1
        } на ${+m.new_value + 1}`;
      }
      if (m.verb === 'move') {
        if (m.new_value === m.workspace_detail.name) {
          return 'перенес(-ла) документ в корневую директорию';
        } else {
          return `перенес(-ла) документ в директорию "${m.new_value}"`;
        }
      }
    case 'sprint':
      if (m.verb === 'updated') {
        return `изменил(-а) спринт с "${m.old_value}" на "${m.new_value}"`;
      }
      if (m.verb === 'added') {
        return `добавил(-а) спринт "${m.new_value}"`;
      }
      if (m.verb === 'removed') {
        return `убрал(-а) спринт "${m.old_value}"`;
      }
    case 'description':
      if (m.verb === 'updated') {
        return 'изменил(-а) описание';
      }
      if (m.entity_type === 'doc') {
        return 'изменил(-а) описание';
      }

    case 'project':
      if (m.verb === 'move') {
        const newProjectName = m.project_detail?.name
          ? m.project_detail.name
          : 'в скрытый/удаленный проект';
        const oldProjectName = m.old_entity_detail.name
          ? m.old_entity_detail.name
          : 'из скрытого/удаленного проекта';
        return `перенес(-ла) задачу из "${oldProjectName}" в "${newProjectName}"`;
      }

    case 'target_date':
      if (m.verb === 'updated') {
        const newDate =
          m.new_value instanceof Date || canBeConvertedToDate(m.new_value)
            ? formatDate(m.new_value)
            : '';
        const oldDate =
          m.old_value &&
          (m.old_value instanceof Date || canBeConvertedToDate(m.old_value))
            ? formatDate(m.old_value.replace(/"/g, ''))
            : '';

        if (m.old_value === '<nil>' || !m.old_value) {
          return `установил(-а) срок исполнения ${newDate}`;
        } else if (m.new_value === '' && oldDate) {
          return `убрал(-а) срок исполнения ${oldDate}`;
        } else {
          return oldDate && newDate
            ? `изменил(-а) срок исполнения с ${oldDate} на ${newDate}`
            : 'изменил(-а) срок исполнения';
        }
      }

    default:
      return `${aiplan.ru_verb(m)}
              ${aiplan.ru_field(m)} ${aiplan.ru_value(m)}`;
  }
};
