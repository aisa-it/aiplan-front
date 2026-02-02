import { TypesFormFields } from "@aisa-it/aiplan-api-ts/src/data-contracts";

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
