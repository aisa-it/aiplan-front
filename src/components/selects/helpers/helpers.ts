import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { Member } from '../types/types';

export function memberFullName(member: DtoUserLight) {
  return aiplan.UserName(member).join(' ') || 'Не Выбран';
}

export function MemberToIdArray(members: Member[]): string[] {
  return (
    members
      .map((el) => el?.member?.id)
      .filter((id): id is string => Boolean(id)) ?? []
  );
}
