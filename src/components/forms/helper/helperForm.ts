import dayjs from 'dayjs';
import {
  ERROR_EDIT_FORM,
  SUCCESS_CREATE_FORM,
} from 'src/constants/notifications';
import { useNotificationStore } from 'src/stores/notification-store';
import { isValidDate } from 'src/utils/validation';

const { setNotificationView } = useNotificationStore();

// Блок для создания/ракдактирования формы

export const upper = (index: number, array: object[] = []) => {
  if (index > 0 && index < array.length) {
    [array[index], array[index - 1]] = [array[index - 1], array[index]];
  }
};

export const lower = (index: number, array: object[] = []) => {
  if (index >= 0 && index < array.length - 1) {
    [array[index], array[index + 1]] = [array[index + 1], array[index]];
  }
};

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

export const addQuestion = (object: object, linkSelect: object[]) => {
  if (object.type === 'select') {
    object.validate = { opt: [] };
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
    fields: data.fields.map((el) => {
      return {
        type: el.type,
        label: el.label,
        required: el.required,
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
