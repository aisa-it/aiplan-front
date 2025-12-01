export interface ISprintRow {
  id: string;
  type: 'sprint';
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  expanded: boolean;
  issues: IIssueRow[];
}

export interface IIssueRow {
  id: string;
  type: 'task';
  parentId: string;
  parentExpanded: boolean;
  name: string;
  status: string;
  priority: string;
  tags: string[];
  assignees: string[];
  startDate: string;
  endDate: string;
  progress: number;
}
