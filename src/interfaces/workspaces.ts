import { IUser } from 'src/interfaces/users';

export interface IWorkspaceBackup {
  id: string;
  created_at: Date;
  created_by_id: string;
  workspace_id: string;
  asset: string;
  created_by: any | null;
  workspace_detail: any | null;
}

export interface IWorkspaceMemberInvitation {
  accepted: boolean;
  readonly id: string;
  email: string;
  token: string;
  message: string;
  responded_at: Date;
  role: 5 | 10 | 15 | 20;
  created_by_detail: any;
  workspace: any;
}

export interface IWorkspaceMember {
  id: string,
  role: number;
  member: IUser;
  member_id: string;
  workspace: any;
  created_at: Date;
  created_by: any | null;
  updated_at: Date,
  workspace_id: string;
  created_by_id: string;
  updated_by_id: string | null;
  editable_by_admin: boolean;
}
