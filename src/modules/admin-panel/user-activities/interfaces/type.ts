import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface IActivity {
  id: string;
  created_at: string;
  verb: 'created' | 'deleted';
  field: string;
  new_value: string;
  entity_type: string;
  new_entity_detail?: {
    id: string;
    name: string;
    logo: string | null;
    slug: string;
    owner_id: string;
    url: string;
  };
  actor_detail: DtoUserLight;
  old_value?: string;
}
