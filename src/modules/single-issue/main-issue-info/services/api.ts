import { AiplanIssueLockResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiIssues = new (withInterceptors(Issues))();

export const api = {
  lockEditDescription: async (
    wsSlug: string,
    projectId: string,
    issueIdOrSeq: string,
  ): Promise<AiplanIssueLockResponse> => {
    return apiIssues
      .issueDescriptionLock(wsSlug, projectId, issueIdOrSeq)
      .then((res) => res.data)
      .catch((err) => err.response.data);
  },

  unlockEditDescription: async (
    wsSlug: string,
    projectId: string,
    issueIdOrSeq: string,
  ): Promise<void> => {
    return apiIssues
      .issueDescriptionUnlock(wsSlug, projectId, issueIdOrSeq)
      .then((res) => res.data);
  },
};
