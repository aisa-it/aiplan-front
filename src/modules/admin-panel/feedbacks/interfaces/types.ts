export interface DaoPagination {
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  descending?: boolean;
  rowsNumber?: number;
}
