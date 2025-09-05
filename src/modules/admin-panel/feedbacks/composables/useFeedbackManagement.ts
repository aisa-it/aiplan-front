import { ref } from 'vue';
import { api } from '../services/api';
import type { DtoUserFeedback } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function useFeedbackManagement() {
  const currentFeedback = ref<DtoUserFeedback>({});
  const isFeedbackDetailOpen = ref(false);

  const openFeedbackDetail = (feedback: DtoUserFeedback) => {
    currentFeedback.value = feedback;
    isFeedbackDetailOpen.value = true;
  };

  const closeFeedbackDetail = () => {
    currentFeedback.value = {};
    isFeedbackDetailOpen.value = false;
  };

  const exportFeedbacks = async () => {
    await api.exportFeedbacks();
  };

  return {
    currentFeedback,
    isFeedbackDetailOpen,
    openFeedbackDetail,
    closeFeedbackDetail,
    exportFeedbacks,
  };
}
