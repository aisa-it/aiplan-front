import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';

export function memberFullName(member: DtoUserLight) {
  return aiplan.UserName(member).join(' ') || 'Не Выбран';
}
