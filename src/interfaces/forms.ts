import {
  DtoFormLight,
  TypesFormFields,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// TODO типы доделать
export interface IForms extends DtoFormLight {}

//fixme убрать, когда обновится тип в data-contracts
export interface DtoDependOn {
  field_index: number | null;
  option_index?: number | null;
  value?: any;
}

export type ExtendedFormFields = TypesFormFields & {
  depend_on?: DtoDependOn | null;
};

export type GroupedFormField = ExtendedFormFields & {
  originalIndex: number;
};

export interface IFormFields {
  label: string;
  type: FieldType;
  validate: IFormFieldValidate;
}

export interface IFormFieldValidate {
  validation_type: string;
  value_type: FieldType;
  opt?: string[] | undefined;
}

export interface IFormNewField {
  label: string;
  require: boolean;
  type: string;
  value: null;
}

export type FieldType = 'checkbox' | 'input' | 'textarea' | 'numeric';
