import { computed, nextTick, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useUtilsStore } from 'src/stores/utils-store';
import UserInfoPopup from 'src/components/UserInfoPopup.vue';

interface IAvatarImageProps {
  text: string;
  prefix?: string;
  tooltip?: string;
  error?: string;
  icon?: string;
  image?: string;
  rounded?: boolean;
  border?: boolean;
  size?: string;
  btnsize?: string;
  member?: Record<string, any>;
  noHat?: boolean;
  showAvatarPopup?: boolean;
  isPopupTextCenter?: boolean;
  isShowPopupMiddle?: boolean;
}

export const useAvatarImage = (props: IAvatarImageProps) => {
  // Логика попапа при наведении на аватар
  const utilsStore = useUtilsStore();
  const { ny } = storeToRefs(utilsStore);

  const userPopup = ref<InstanceType<typeof UserInfoPopup> | undefined>();
  const closeTimer = ref<ReturnType<typeof setTimeout> | undefined>();
  const isShowMenu = ref<boolean>(false);
  const proportionHat = computed<number>(() =>
    props.size ? Number(props.size) * 1.125 : 36,
  );

  const openMenu = (): void => {
    if (!props.member) return;
    isShowMenu.value = true;
    nextTick(() => userPopup.value?.showMenu());
  };

  const closeMenu = (): void => {
    if (!props.member) return;
    closeTimer.value = setTimeout(() => {
      isShowMenu.value = false;
    }, 200);
  };

  const cancelCloseMenu = (): void => {
    isShowMenu.value = true;
    clearTimeout(closeTimer.value);
  };

  const handleClickBtn = (): void => {
    isShowMenu.value ? (isShowMenu.value = false) : openMenu();
  };

  return {
    userPopup,
    isShowMenu,
    openMenu,
    cancelCloseMenu,
    closeMenu,
    handleClickBtn,
    ny,
    proportionHat,
  };
};
