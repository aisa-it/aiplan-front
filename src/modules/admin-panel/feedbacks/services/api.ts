import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import {
  DaoPaginationResponse,
  DtoUserFeedback,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import pako from 'pako';
import { IQueryParams } from 'src/shared/types/query-params';

const apiAdminPanel = new (withInterceptors(AdminPanel))();
export const api = {
  getFeedbacks: async (
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoUserFeedback[];
    }
  > => {
    return apiAdminPanel.getAllFeedbackList(data).then((res) => res.data);
  },

  exportFeedbacks: async (): Promise<void> => {
    const response = await apiAdminPanel.exportFeedbackList({
      format: 'arraybuffer',
    });

    if (!response.data) {
      throw new Error('Empty response from server');
    }

    const decompressed = pako.inflate(response.data, {
      to: 'string',
    });

    const blob = new Blob([decompressed], { type: 'text/csv;charset=utf-8' });

    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'feedbacks.csv';

    if (contentDisposition) {
      const match = contentDisposition.match(
        /filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n"']*)['"]?;?/i,
      );
      if (match && match[1]) {
        fileName = match[1].trim();
      } else {
        const fallbackMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fallbackMatch) {
          fileName = fallbackMatch[1];
        }
      }

      fileName = fileName.replace(/\.gz$/i, '');
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  },
};
