import { useNotificationStore } from 'src/stores/notification-store';
import { ERROR_COPY_LINK_TO_CLIPBOARD } from 'src/constants/notifications';

// ссылка, которая открывает поиск с этим запросом
export const aqlLink = (query: string) =>
  `${window.location.origin}/s/?aql=${encodeURIComponent(query)}`;

// Запрос в адресе текущей страницы, null — убрать. Мимо роутера: страница под
// окном поиска не должна реагировать, шаг в истории браузера не добавляется
export const setAqlInAddress = (query: string | null) => {
  const url = new URL(window.location.href);
  if (query === null) url.searchParams.delete('aql');
  else url.searchParams.set('aql', query);
  if (url.href !== window.location.href)
    window.history.replaceState(window.history.state, '', url);
};

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
