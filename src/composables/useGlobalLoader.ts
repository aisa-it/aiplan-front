import { QSpinnerTail, Loading } from 'quasar';

export function useGlobalLoading() {
  return Loading.show({
    spinner: QSpinnerTail,
    spinnerColor: 'primary',
  });
}

export function stopGlobalLoading() {
  Loading.hide();
}
