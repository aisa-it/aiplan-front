export interface ProjectBase {
  id?: string;
  name?: string;
}

export interface HistoryEntry {
  field: string;
  verb: string;
  old_value: string | null;
  new_value: string | null;
  old_identifier?: string;
  new_identifier?: string;
  old_entity_detail?: any;
  new_entity_detail?: any;
  target_user?: any;
  project_id?: string;
  workspace_detail?: { name: string };
  project_detail?: { name: string };
  entity_type?: string;
}

export type HistoryRenderer = (
  m: HistoryEntry,
  wsProjects: ProjectBase[],
) => string | undefined;

