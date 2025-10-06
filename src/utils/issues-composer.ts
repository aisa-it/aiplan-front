import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';
import { storeToRefs } from 'pinia';
import { useLoaderStore } from 'src/stores/loader-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { IIssueFilters, IQuasarPaginationValues } from 'src/interfaces/issues';
import {
  API_AUTH_PREFIX,
  API_WORKSPACES_PREFIX,
} from 'src/constants/apiPrefix';

const issuesStore = useIssuesStore();
const loaderStore = useLoaderStore();
const viewProps = useViewPropsStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
export interface IGroupByParams {
  by: string;
  id: string;
}

export interface IIssueRequestParams {
  pagination: IQuasarPaginationValues;
  personalIssuesTemplate?: string;
  urlData?: {
    workspaceSlug: string;
    projectID: string;
  };
  groupByParams?: IGroupByParams;
  searchText?: string;
  workspaces?: string[];
  projects?: string[];
  states?: string[];
}

export default async function issuesComposer(data: IIssueRequestParams) {
  const filters: IIssueFilters = {
    search_query: data.searchText,
    states: viewProps.props?.filters.states,
  };

  if (data.workspaces) filters.workspaces = data.workspaces;
  if (data.projects) filters.projects = data.projects;

  if (data.groupByParams) {
    switch (data.groupByParams.by) {
      case 'State':
        filters.states = [data.groupByParams.id];
        break;
      case 'Label':
        filters.labels = [data.groupByParams.id];
        break;
      case 'Created by':
        filters.authors = [data.groupByParams.id];
        break;
      case 'Assignee to':
        filters.assignees = [data.groupByParams.id];
        break;
      case 'Watchers':
        filters.watchers = [data.groupByParams.id];
        break;
      case 'Priority':
        filters.priorities = [data.groupByParams.id];
        break;
      case 'Workspace':
        filters.workspaces = [data.groupByParams.id];
        break;
      case 'Project':
        filters.projects = [data.groupByParams.id];
        break;
    }
  }
  // if (data.personalIssuesTemplate) {
  //   switch (data.personalIssuesTemplate) {
  //     case 'assigned_to_me':
  //       filters.assigned_to_me = true;
  //       break;

  //     case 'authored_by_me':
  //       filters.authored_by_me = true;
  //       break;

  //     case 'watched_by_me':
  //       filters.watched_by_me = true;
  //       break;

  //     default:
  //       break;
  //   }
  // }

  const url =
    data.urlData &&
    data.groupByParams?.by !== 'Project' &&
    data.groupByParams?.by !== 'Workspace'
      ? `${API_WORKSPACES_PREFIX}/${
          data.urlData.workspaceSlug ?? currentWorkspaceSlug.value
        }/projects/${
          data.urlData.projectID ?? currentProjectID.value
        }/issues/search/`
      : `${API_AUTH_PREFIX}/issues/search/`;

  const pg = {
    offset:
      (data.pagination.page - 1) *
      (!data.pagination.rowsPerPage
        ? DEF_ROWS_PER_PAGE
        : data.pagination.rowsPerPage),
    limit:
      data.pagination.rowsPerPage == 0
        ? data.pagination.rowsNumber || DEF_ROWS_PER_PAGE
        : data.pagination.rowsPerPage,
    order_by: data.pagination.sortBy,
    desc: data.pagination.descending,
    show_sub_issues: viewProps.props?.showSubIssues,
    only_count: false,
    draft: viewProps.props?.draft,
    only_active: viewProps.props?.showOnlyActive,
  };

  const res = await issuesStore.getIssues(url, pg, filters);
  loaderStore.stopTableLoading();

  return res;
}
