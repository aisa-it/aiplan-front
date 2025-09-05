import { computed } from 'vue';
import { Screen } from 'quasar';
import aiplan from 'src/utils/aiplan';

export const useProfilePreview = () => {
  // Предпросмотр профиля пользователя
  const isMobile = computed<boolean>(() => Screen.width <= 600);

  const getUsername = (members: any) => {
    return aiplan
      .UserName(members)
      .map((m) => m?.[0])
      .join(' ');
  };

  return { isMobile, getUsername };
};
