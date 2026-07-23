export interface IFilter {
  name: string;
  description: string;
  public: boolean;
  filter: IFilterInner;
}

export interface IFilterInner {
  search_query?: string;
  states: string[];
  labels: string[];
  authors: string[];
  projects: string[];
  watchers: string[];
  assignees: string[];
  workspaces: string[];
  priorities: string[];
  only_active: boolean;
  created_at_from?: string;
  created_at_to?: string;
  target_date_from?: string;
  target_date_to?: string;
  start_date_from?: string;
  start_date_to?: string;
  completed_at_from?: string;
  completed_at_to?: string;
  updated_at_from?: string;
  updated_at_to?: string;
}

export interface IFilterResponse {
  author_detail: any;
  author_id: string;
  created_at: Date;
  description: string;
  filter: IFilter;
  id: string;
  name: string;
  public: boolean;
  updated_at: Date;
}
