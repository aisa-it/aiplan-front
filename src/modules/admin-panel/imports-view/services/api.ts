import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import { IssuesImportImportStatus } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiAdminPanel = new (withInterceptors(AdminPanel))();
export const api = {
  getActiveImports: async (): Promise<IssuesImportImportStatus[]> => {
    return apiAdminPanel.getRunningImportList().then((res) => res.data);
  },
};
