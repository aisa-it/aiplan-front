import { isTextSelected } from 'src/utils/textSelectCheck';
import { useRouter } from 'vue-router';

export const useTableRowClick = () => {
  const router = useRouter();
  const route = '/projects';

  const onRowClick = (e: Event, row: any): void => {
    if (isTextSelected()) return;
    router.push(`${row.id}${route}`);
  };

  return { onRowClick };
};
