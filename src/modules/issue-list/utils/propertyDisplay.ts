import dayjs from 'dayjs';
import { DtoIssueProperty } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface PropertyDisplay {
  // текст для показа («—» для пустого)
  text: string;
  isEmpty: boolean;
  // для типа link — адрес, текст — название ссылки
  linkUrl?: string;
  // для типа boolean — true, если флаг установлен
  checked?: boolean;
}

// значение параметра задачи для шаблона (row.properties приходит с бэка
// только при include_properties=true)
export const findIssueProperty = (
  row: any,
  templateId?: string,
): DtoIssueProperty | undefined =>
  (row?.properties as DtoIssueProperty[] | undefined)?.find(
    (p) => p.template_id === templateId,
  );

// единое отображение значения параметра для таблицы и доски.
// Контракт значений как в SelectPropertyDate: date — YYYY-MM-DD,
// datetime — unix time в секундах строкой; lookup — id строки, показываем value_label;
// multiselect — массив строк, показываем через запятую
export const formatPropertyValue = (
  type: string | undefined,
  prop: DtoIssueProperty | undefined,
): PropertyDisplay => {
  const v: any = prop?.value ?? null;

  if (type === 'boolean') {
    return {
      text: v === true ? 'Да' : '—',
      isEmpty: v !== true,
      checked: v === true,
    };
  }
  if (type === 'link') {
    const url: string = v?.url ?? '';
    return { text: v?.name || url || '—', isEmpty: !url, linkUrl: url };
  }
  if (type === 'multiselect') {
    const items = Array.isArray(v) ? v.map(String).filter(Boolean) : [];
    return {
      text: items.length ? items.join(', ') : '—',
      isEmpty: !items.length,
    };
  }
  if (v === null || v === undefined || v === '') {
    return { text: '—', isEmpty: true };
  }

  switch (type) {
    case 'lookup':
      return { text: prop?.value_label ?? String(v), isEmpty: false };
    case 'datetime': {
      const parsed = dayjs.unix(Number(v));
      return {
        text: parsed.isValid()
          ? `${parsed.format('DD.MM.YYYY HH:mm')} (UTC${dayjs().format('Z')})`
          : String(v),
        isEmpty: false,
      };
    }
    case 'date': {
      const parsed = dayjs(v);
      return {
        text: parsed.isValid() ? parsed.format('DD.MM.YYYY') : String(v),
        isEmpty: false,
      };
    }
    default:
      return { text: String(v), isEmpty: false };
  }
};
