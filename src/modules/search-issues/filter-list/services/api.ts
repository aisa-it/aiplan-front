import {
  AiplanFilterParams,
  DtoSearchFilterLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { SearchFilters } from '@aisa-it/aiplan-api-ts/src/SearchFilters';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(SearchFilters))();
const apiProjects = new (withInterceptors(Projects))();

const deleteFilter = async (filterId: string) => {
  return await api.deleteSearchFilter(filterId);
};

const getFilterMembers = async (data: AiplanFilterParams) => {
  return apiProjects.getFilterMemberList(data, { limit: 1000 });
};

const getFilterLabels = async (data: AiplanFilterParams) => {
  return apiProjects.getFilterLabelList(data, { limit: 1000 });
};

const getFilterStates = async (data: AiplanFilterParams) => {
  return apiProjects.getFilterStateList(data, { limit: 1000 });
};

const updateFilter = async (filterId: string, data: DtoSearchFilterLight) => {
  return await api.updateSearchFilter(filterId, data);
};

const createSearchFilter = async (data: DtoSearchFilterLight) => {
  return await api.createSearchFilter(data);
};

const addMyFilter = async (filterId: string) => {
  return await api.addSearchFilterToMe(filterId);
};

const deleteMyFilter = async (filterId: string) => {
  return await api.deleteSearchFilterFromMe(filterId);
};

export {
  deleteFilter,
  getFilterMembers,
  getFilterLabels,
  getFilterStates,
  updateFilter,
  createSearchFilter,
  addMyFilter,
  deleteMyFilter,
};
