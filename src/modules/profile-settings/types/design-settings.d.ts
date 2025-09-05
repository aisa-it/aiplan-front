export interface ITheme {
  label: string;
  value: string;
}

export interface ICurrentTheme extends ITheme {
  is_dark: boolean;
}

export interface IIssue {
  label: string;
  value: boolean;
}

export interface IAutosave {
  label: string;
  value: boolean;
}
