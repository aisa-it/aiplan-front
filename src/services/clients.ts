import axios from 'axios';
import { Integrations } from '@aisa-it/aiplan-api-ts/src/Integrations';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';

import { applyInterceptors } from '@/utils/interceptors';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

export const usersApi = new (withInterceptors(Users))();
export const workspaceApi = new (withInterceptors(Workspace))();
export const projectsApi = new (withInterceptors(Projects))();
export const integrationsApi = new (withInterceptors(Integrations))();

export const httpClient = applyInterceptors(
  axios.create({ baseURL: '', withCredentials: true }),
);
