import { TypesFormFields } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import dayjs from 'dayjs';
import {
  ERROR_EDIT_FORM,
  SUCCESS_CREATE_FORM,
} from 'src/constants/notifications';
import { useNotificationStore } from 'src/stores/notification-store';
import { isValidDate } from 'src/utils/validation';
import { ExtendedFormFields, GroupedFormField } from '../types/types';

const { setNotificationView } = useNotificationStore();

// Блок для создания/ракдактирования формы

export const upper = (index: number, array: any[] = []) => {
  if (index > 0 && index < array.length) {
    updateDependenciesOnMove(array, index, index - 1);
    [array[index], array[index - 1]] = [array[index - 1], array[index]];
  }
};

export const lower = (index: number, array: any[] = []) => {
  if (index >= 0 && index < array.length - 1) {
    updateDependenciesOnMove(array, index, index + 1);
    [array[index], array[index + 1]] = [array[index + 1], array[index]];
  }
};

function updateDependenciesOnMove(
  array: any[],
  oldIndex: number,
  newIndex: number,
) {
  const itemMovingToNewIndex = array[oldIndex];
  const itemMovingToOldIndex = array[newIndex];

  array.forEach((item) => {
    if (!item.depend_on) return;

    if (item.depend_on.field_index === oldIndex) {
      item.depend_on.field_index = newIndex;
    } else if (item.depend_on.field_index === newIndex) {
      item.depend_on.field_index = oldIndex;
    }
  });

  if (
    itemMovingToNewIndex.depend_on &&
    itemMovingToNewIndex.depend_on.field_index >= newIndex
  ) {
    itemMovingToNewIndex.depend_on = null;
  }

  if (
    itemMovingToOldIndex.depend_on &&
    itemMovingToOldIndex.depend_on.field_index >= oldIndex
  ) {
    itemMovingToOldIndex.depend_on = null;
  }
}

export const deleteQuestion = (index: number, array: object[] = []) => {
  array.splice(index, 1);
};

export const minDate = (date: string) => {
  return date >= dayjs(new Date()).format('YYYY/MM/DD');
};

export const validDate = (date: string): true | string => {
  if (date?.length === 0) return true;

  const parts = date.split('.');
  if (parts.length !== 3) return 'Некорректная дата';

  const [day, month, year] = parts.map(Number);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1000 ||
    year > 9999
  ) {
    return 'Некорректная дата';
  }

  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(inputDate.getTime())) {
    return 'Некорректная дата';
  }

  if (inputDate < today) {
    return 'Дата не может быть меньше текущей';
  }

  return true;
};

export const serializationDate = (date: string, toISO: boolean) => {
  if (!date?.length) return date;

  if (toISO) {
    return date.split('.').reverse().join('-');
  } else {
    return date?.split('-')?.reverse()?.join('.');
  }
};

export const onSuccess = () => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_CREATE_FORM,
  });
};

export const onError = () => {
  setNotificationView({
    open: true,
    type: 'error',
    customMessage: ERROR_EDIT_FORM,
  });
};

export const addQuestion = (object: any, linkSelect: any[]) => {
  if (typeof object === 'object' && object !== null) {
    object.depend_on = null;
    if (object.type === 'select') {
      object.validate = { opt: [] };
    }
  }
  linkSelect.push(object);
};

export const validateFormWithSlug = (data) => {
  const object = {
    title: data.title,
    description: data.description,
    auth_require: data.auth_require,
    end_date: serializationDate(data.end_date, false),
    target_project_id: data.target_project_id,
    notification_channels: data.notification_channels || {
      app: false,
      telegram: false,
      email: false,
    },
    fields: data.fields.map((el) => {
      return {
        type: el.type,
        label: el.label,
        required: el.required,
        depend_on: el.depend_on || null,
        issue_name_field:
          el.type === 'input' ? (el.issue_name_field ?? false) : undefined,
        validate:
          el.type === 'date'
            ? undefined
            : {
                validation_type: el.validate.validation_type,
                value_type: el.validate.value_type,
                opt: el.validate.opt,
              },
      };
    }),
  };
  return object;
};

export const getDate = () => {
  const now = new Date();
  return now.toLocaleDateString();
};

// Блок для прохождения формы

export const getFieldType = (fieldType: string) => {
  switch (fieldType) {
    case 'numeric':
    case 'color':
      return 'input';
    case 'date':
      return 'text';
    default:
      return fieldType;
  }
};

export const getFieldMaxLenght = (fieldType: string) => {
  switch (fieldType) {
    case 'input':
      return 300;
    case 'textarea':
      return 1000;
    default:
      return;
  }
};

export const getFieldLabel = (field) => {
  switch (field.type) {
    case 'input':
      return 'Введите текст одной строкой. Например: "Иван Иванов".';
    case 'textarea':
      return 'Введите текст. Для нового абзаца нажмите Enter.';
    case 'numeric':
      return 'Введите целое число. Например: 10, 25, 100.';
    case 'date':
      return 'Выберите дату из календаря или введите в формате ДД.ММ.ГГГГ (например, 25.12.2023)';
    case 'color':
      return 'Выберите цвет из палитры или введите HEX-код (например, #FF5733)';
    default:
      return field.label;
  }
};

export const getErrorMessage = (type: string) => {
  switch (type) {
    case 'date':
      return 'Введите корректную дату в формате ДД.ММ.ГГГГ';
    case 'color':
      return 'Введите корректное значение из 7 символов';
    case 'select':
    case 'multiselect':
      return 'Обязательное поле';
    default:
      return undefined;
  }
};

export const getMask = (fieldType: string) => {
  return fieldType === 'date' ? '##.##.####' : '';
};

export const getRules = (fieldType: string, required: boolean) => {
  const rules = [];
  if (fieldType === 'numeric') {
    rules.push(
      (val) =>
        (Number(val) <= 9999999999999 && Number(val) >= 0) ||
        'Введите число от 0 до 9999999999999',
    );
  }
  if (fieldType === 'input') {
    rules.push((val) => val.length <= 300 || 'Слишком длинный текст');
  }
  if (fieldType === 'textarea') {
    rules.push((val) => val.length <= 1000 || 'Слишком длинный текст');
  }
  if (fieldType === 'date') {
    rules.push((val) => {
      isValidDate(val);
    });
  }

  if (fieldType === 'color') {
    rules.push(
      (val) =>
        !val ||
        /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(val) ||
        'Неверный формат цвета, введите HEX-код (например, #FF5733)',
    );
  }

  if (required && fieldType !== 'checkbox') {
    rules.push((val) => (val !== '' && val !== null) || 'Обязательное поле');
  }
  return rules;
};

export const groupFieldsByDependency = (
  fields: ExtendedFormFields[],
): GroupedFormField[][] => {
  const levels: GroupedFormField[][] = [];
  const memo = new Map<number, number>();
  const visiting = new Set<number>();

  const getLevel = (index: number): number => {
    if (memo.has(index)) return memo.get(index)!;

    if (visiting.has(index)) {
      console.warn(`Circular dependency detected at field index ${index}`);
      return 0;
    }

    visiting.add(index);

    const field = fields[index];
    let level = 0;

    if (field && field.depend_on) {
      const parentIndex = field.depend_on.field_index;

      if (parentIndex !== null && fields[parentIndex]) {
        level = getLevel(parentIndex) + 1;
      }
    }

    visiting.delete(index);
    memo.set(index, level);
    return level;
  };

  fields.forEach((field, index) => {
    const level = getLevel(index);
    if (!levels[level]) {
      levels[level] = [];
    }
    levels[level].push({ ...field, originalIndex: index });
  });
  return levels.filter((l) => l && l.length > 0);
};

export const findVisiblePage = (
  startPage: number,
  direction: number,
  pages: any[][],
  allFields: any[],
) => {
  let i = startPage + direction;
  while (i >= 0 && i < pages.length) {
    if (pages[i].some((field) => isFieldVisible(field, allFields))) {
      return i;
    }
    i += direction;
  }
  return -1;
};

export const isFieldVisible = (field: any, fields: any[]) => {
  if (!field.depend_on) return true;
  const { field_index, option_index, value: dependValue } = field.depend_on;

  if (field_index === undefined || field_index === null) return true;

  const parent = fields[field_index];
  if (!parent) return false;

  if (!isFieldVisible(parent, fields)) return false;

  if (parent.type === 'checkbox') {
    return String(parent.value) === String(dependValue);
  }

  if (parent.type === 'select' || parent.type === 'multiselect') {
    if (!Array.isArray(parent.value)) return false;

    let targetValue: any;
    if (option_index !== undefined && option_index !== null) {
      const option = parent.validate.opt[option_index];
      targetValue = typeof option === 'object' ? option.value : option;
    } else {
      targetValue = dependValue;
    }

    return parent.value.some(
      (opt: any) => String(opt.value) === String(targetValue),
    );
  }

  return true;
};

export const getSubmissionValue = (field: any) => {
  if (field.type === 'date') {
    const isoDate = serializationDate(field.value, true);
    return {
      value: new Date(isoDate).getTime(),
    };
  }
  if (field.type === 'multiselect') {
    return {
      value: field.value?.length
        ? field.value?.map((el: any) => el.value)
        : null,
    };
  }
  if (field.type === 'select') {
    return {
      value: field.value[0]?.value ?? null,
    };
  }
  return { value: field.value || null };
};

export const resetFieldValues = (targetFields: any[], allFields: any[]) => {
  targetFields.forEach((field) => {
    const originalIndex =
      field.originalIndex !== undefined
        ? field.originalIndex
        : allFields.indexOf(field);
    const targetField = allFields[originalIndex];

    switch (targetField.type) {
      case 'checkbox':
        targetField.value = false;
        break;
      case 'numeric':
        targetField.value = null;
        break;
      case 'color':
        targetField.value = '';
        break;
      case 'attachment':
        targetField.value = [];
        break;
      case 'select':
      case 'multiselect':
        targetField.value = [];
        break;
      case 'date':
        targetField.value = null;
        break;
      default:
        if (targetField.validate?.value_type === 'numeric') {
          targetField.value = null;
        } else if (targetField.validate?.value_type === 'string') {
          targetField.value = '';
        }
    }
  });
};

export const isFieldInvalid = (field: any) => {
  const { value, type, required } = field;
  if (type === 'date') {
    if (
      value &&
      (value.length !== 10 ||
        Number(value.split('.')[2]) < 1000 ||
        isNaN(new Date(serializationDate(value, true)).getTime()))
    ) {
      return true;
    }
  }
  if (type === 'color') {
    if (value && value.length !== 7) return true;
  }
  if ((type === 'select' || type === 'multiselect') && required) {
    if (!value.length) {
      return true;
    }
  }
  return false;
};
