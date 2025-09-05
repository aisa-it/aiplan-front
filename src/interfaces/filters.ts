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
