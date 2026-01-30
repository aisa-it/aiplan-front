// export interface IProject {
//   created_at: Date;
//   created_by: string;
//   cover_image: string | null;
//   cycle_view: boolean;
//   default_assignee: any | string | null;
//   default_watcher: any | string | null;
//   description: string;
//   emoji: string | null;
//   emoji_and_icon:
//     | string
//     | {
//         name: string;
//         color: string;
//       }
//     | null;
//   estimate: string | null;
//   icon_prop: {
//     name: string;
//     color: string;
//   } | null;
//   id: string;
//   identifier: string;
//   is_favorite: boolean;
//   issue_views_view: boolean;
//   module_view: boolean;
//   name: string;
//   network: number;
//   page_view: boolean;
//   project_lead: any | string | null;
//   slug: string;
//   total_cycles: number;
//   total_members: number;
//   total_modules: number;
//   updated_at: Date;
//   updated_by: string;
//   workspace: any | string;
//   workspace_detail: any;
//   rules_script: string | null;
// }

export interface IProject {
  cover_image: string;

  created_at: string;

  created_by: string;

  default_assignees: any;

  default_assignees_details: any;
  default_watchers: any;
  default_watchers_details: any;
  description: string;

  description_html: null | string;

  description_text: null | string;

  emoji: any;

  estimate: any;

  id: string;

  identifier: string;

  is_favorite: boolean;

  name: string;

  public: any;

  project_lead: string;

  project_lead_detail: any;
  rules_script: any;

  total_members: number;

  updated_at: string;

  updated_by: any;
  workspace: string;

  workspace_detail: any;
}

export interface IProjectLeader {
  member?: any;
  label: string;
  value: string;
}

export interface IProjectView {
  issueView: 'list' | 'kanban' | 'calendar' | 'gantt_chart';
  filters: IProjectFilters;
  showEmptyGroups: boolean;
  hideSubIssues: boolean;
  showOnlyActive: boolean;
  draft: boolean;
  group_tables_hide: any;
  activeTab: string;
  columns_to_show: string[];
  autoSave: boolean;
}

export interface IProjectFilters {
  group_by:
    | 'State'
    | 'Priority'
    | 'Created by'
    | 'Assignee to'
    | 'Label'
    | 'Watchers'
    | 'Workspace'
    | 'None';
  order_by:
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'name'
    | 'priority'
    | 'target_date'
    | 'sequence_id'
    | 'state'
    | 'labels'
    | 'sub_issues_count'
    | 'link_count'
    | 'attachment_count'
    | 'assignees'
    | 'watchers'
    | 'author'
    | 'sprint';
  orderDesc: boolean;
  states: string[];
}

export interface IProjectLabelLite {
  name: string;
  color: string;
}
