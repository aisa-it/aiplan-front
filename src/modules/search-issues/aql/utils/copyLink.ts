import { useNotificationStore } from 'src/stores/notification-store';
import { ERROR_COPY_LINK_TO_CLIPBOARD } from 'src/constants/notifications';

// ссылка, которая открывает поиск с этим запросом
export const aqlLink = (query: string) =>
  `${window.location.origin}/s/?aql=${encodeURIComponent(query)}`;

// вызывать в setup: возвращает функцию, копирующую ссылку на запрос
export const useCopyAqlLink = () => {
  const { setNotificationView } = useNotificationStore();

  return async (query: string) => {
    try {
      await navigator.clipboard.writeText(aqlLink(query));
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Ссылка скопирована',
      });
    } catch {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
      });
    }
  };
};
