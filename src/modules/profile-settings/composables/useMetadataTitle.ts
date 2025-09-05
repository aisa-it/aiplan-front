import { computed} from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';

import { useUserStore } from 'src/stores/user-store';
import { IUser } from 'src/interfaces/users';

export const useMetadataTitle = () => {
  // Метаданные заголовка
  const userStore = useUserStore();
  const { user } = storeToRefs(userStore);

  const setHeader = (user: Partial<IUser>): string => {
    return user.first_name && user.last_name
      ? `Профиль ${user.first_name} ${user.last_name}`
      : user.email || 'Редактирование профиля';
  };

  const metadataTitle = computed<string>(() => {
    return user.value ? setHeader(user.value as Partial<IUser>) : 'Загрузка...';
  });

  useMeta(() => ({
    title: metadataTitle.value,
  }));

};
