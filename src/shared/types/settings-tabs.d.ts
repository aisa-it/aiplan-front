import { Component } from 'vue';

export interface ISettingsTab {
  name: number;
  label: string;
  dataId?: string;
  isDisabled?: boolean;
  component?: Component;
}
