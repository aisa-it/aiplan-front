// TODO типы доделать
export interface IForms {
  active: boolean;
  auth_require: boolean;
  author_detail: null | any;
  created_at: Date | string;
  created_by: Date | string;
  description: string;
  end_date: Date | string;
  fields: IFormFields;
  id: string;
  slug: string;
  title: string;
  updated_at: Date | string | null;
  updated_by: string | null;
  workspace: string;
  workspace_detail: null | any;
}

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
