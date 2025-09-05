import { SearchFilters } from '@aisa-it/aiplan-api-ts/src/SearchFilters';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(SearchFilters))();

const getFilters = async () => {
  return (await api.getSearchFilterList()).data.result;
};

const getMyFilters = async () => {
  return (await api.getMySearchFilterList()).data;
};

export { getFilters, getMyFilters };
