import { TypesIssuesListFilters } from "@aisa-it/aiplan-api-ts/src/data-contracts";

export interface IIssueSearchInfo {
  id: string;
  workspaceSlug: string;
  projectId: string;
}

export interface IIssueTableParams {
  currentFilter: TypesIssuesListFilters | null;
  chosenTableColumns: { label: string; key: string }[];
  additionalColumnsNumber: number;
  checkedIssuesInfo: IIssueSearchInfo[];
}
