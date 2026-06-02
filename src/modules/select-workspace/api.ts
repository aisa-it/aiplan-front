import { AiplanRequestAddFavorite } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(Workspace))();

const addWorkspaceToFavorite = async (body: AiplanRequestAddFavorite) => {
  return api.addWorkspaceToFavorites(body);
};

const removeWorkspaceFromFavorites = async (workspaceId: string) => {
  return api.removeWorkspaceFromFavorites(workspaceId);
};

export { addWorkspaceToFavorite, removeWorkspaceFromFavorites };
