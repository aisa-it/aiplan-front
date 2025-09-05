import { DtoWorkspaceMember } from '@aisa-it/aiplan-api-ts/src/data-contracts';

/**
 * Фильтр списка пользователей.
 * Оставляем в списке пользователей только незаблокированных или тех, кто уже выбран
 * @param members список пользователей
 * @param modelValue список уже выбранных пользователей (modelValue селекта)
 */

export const filterAvailableMembers = (
  members: DtoWorkspaceMember[],
  modelValue?: any[],
) => {
  return members.filter(
    (member: any) =>
      member?.is_active === true ||
      member?.member?.is_active === true ||
      modelValue?.includes(member?.member_id || member?.id),
  );
};
