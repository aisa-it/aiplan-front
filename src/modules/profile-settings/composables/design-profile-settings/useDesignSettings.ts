// core
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useNotificationStore } from 'stores/notification-store';
// constants
import { NEW_THEMES_OBJ, ISSUE_OPEN } from 'src/constants/themes';
import { ISSUE_AUTO_SAVE, TURN_ON_OFF } from 'src/constants/constants';
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
// types
import {
  IAutosave,
  ICurrentTheme,
  IIssue,
  ITheme,
} from '../../types/design-settings';

export const useDesignSettings = () => {
  // Подключение настроек интерфейса
  // core
  const $q = useQuasar();
  // stores
  const userStore = useUserStore();
  const utilsStore = useUtilsStore();
  const { setNotificationView } = useNotificationStore();
  // store to refs
  const { user } = storeToRefs(userStore);
  const { ny } = storeToRefs(utilsStore);

  // vars
  const themes = ref<ITheme[]>(
    NEW_THEMES_OBJ.map((theme) => ({
      label: theme.label,
      value: theme.value,
    })),
  );
  const isSystemTheme = ref<boolean>(user.value.theme?.system ?? false);
  const currentTheme = ref<ICurrentTheme>(
    NEW_THEMES_OBJ.find((el) => el.is_dark === user.value.theme?.dark) ??
      NEW_THEMES_OBJ[1],
  );
  const currentOpenIssue = ref<IIssue | false>(
    ISSUE_OPEN.find((el) => el.value === user.value.theme?.open_in_new) ??
      false,
  );
  const currentAutoSave = ref<IAutosave | false>(
    ISSUE_AUTO_SAVE.find(
      (el) => el.value === user.value?.view_props?.autoSave,
    ) ?? false,
  );
  const SNOW_DENSITY = [
    { label: 'Мало', value: 100 },
    { label: 'Средне', value: 170 },
    { label: 'Много', value: 250 },
  ];
  const currentSnowDensity = ref(
    SNOW_DENSITY.find(
      (opt) => opt.value === Number(localStorage.getItem('snowDensity')),
    ) ?? SNOW_DENSITY[1],
  );
  const currentSnowEnable = ref<string | null>(localStorage.getItem('snow'));

  // functions
  const handleThemeSelect = async (): Promise<void> => {
    await userStore
      .updateCurrentUser({
        theme: {
          dark: currentTheme.value?.value === 'dark' ? true : false,
          contrast: false,
          open_in_new: currentOpenIssue.value
            ? currentOpenIssue.value.value
            : false,
          system: isSystemTheme.value,
        },
        view_props: {
          issueView: user.value.view_props?.issueView,
          autoSave: currentAutoSave.value ? currentAutoSave.value.value : false,
        },
      })
      .then(() => {
        localStorage.setItem('dark', String(user.value?.theme?.dark));
        $q.dark.set(userStore.getTheme === 'dark');
        setNotificationView({
          open: true,
          type: 'success',
          customMessage: SUCCESS_UPDATE_DATA,
        });
      });
  };

  const setSnow = (value: string): void => {
    localStorage.setItem('snow', value);
    location.reload();
  };

  const setSnowDensity = (value: number): void => {
    const target =
      SNOW_DENSITY.find((opt) => opt.value === value) ?? SNOW_DENSITY[1];
    localStorage.setItem('snowDensity', String(target.value));
    location.reload();
  };

  // hooks
  onMounted(
    () =>
      (currentTheme.value =
        NEW_THEMES_OBJ.find((el) => el.is_dark === user.value?.theme?.dark) ??
        NEW_THEMES_OBJ[1]),
  );

  watch(
    () => user.value,
    (newValue) => {
      if (newValue) {
        currentTheme.value =
          NEW_THEMES_OBJ.find((el) => el.is_dark === user.value.theme?.dark) ??
          NEW_THEMES_OBJ[1];
        currentOpenIssue.value =
          ISSUE_OPEN.find((el) => el.value === user.value.theme?.open_in_new) ??
          false;
        currentAutoSave.value =
          ISSUE_AUTO_SAVE.find(
            (el) => el.value === user.value?.view_props?.autoSave,
          ) ?? false;
      }
    },
  );

  return {
    themes,
    currentTheme,
    isSystemTheme,
    handleThemeSelect,
    currentOpenIssue,
    ISSUE_OPEN,
    currentAutoSave,
    ISSUE_AUTO_SAVE,
    ny,
    currentSnowEnable,
    TURN_ON_OFF,
    setSnow,
    SNOW_DENSITY,
    currentSnowDensity,
    setSnowDensity,
  };
};
