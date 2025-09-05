import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { formatDateTime } from 'src/utils/time';

export const isActive = (row: DtoUserLight): boolean => {
  return (
    !!row.is_active &&
    (!row?.blocked_until || new Date(row?.blocked_until ?? '') < new Date())
  );
};

export const activeStatus = (row: DtoUserLight) => {
  if (isActive(row)) return 'Активный';

  if (new Date(row?.blocked_until ?? '') > new Date()) {
    return `Заблокирован до ${formatDateTime(row?.blocked_until ?? '')}`;
  }

  return 'Заблокирован';
};
