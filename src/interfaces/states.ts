export interface IState {
  readonly id: string | string[];
  color: string;
  readonly created_at: Date;
  readonly created_by: string;
  default: boolean;
  description: string;
  group: 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled';
  name: string;
  project: string;
  readonly project_detail: any;
  sequence: number;
  readonly slug: string;
  readonly updated_at: Date;
  readonly updated_by: string;
  workspace: string;
  workspace_detail: any;
  group_seq_id: number | null;
}

export interface IStateResponse {
  [key: string]: IState[];
}
