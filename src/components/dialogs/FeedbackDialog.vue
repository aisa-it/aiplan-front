<template>
  <q-dialog @hide="$emit('hide')">
    <q-card class="feedback-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-mb-sm q-mt-sm">Обратная связь</h6>
        <span class="body-1"
          >Ваши замечания и предложения помогают нам стать еще лучше!</span
        >
        <q-rating
          v-model="stars"
          size="3.5em"
          color="#FFC90A"
          :readonly="!!readOnlyFeedback"
          :max="5"
        />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="feedback"
          autogrow
          dense
          type="textarea"
          :class="`${
            !!readOnlyFeedback ? 'readonly-textarea' : 'base-textarea'
          } full-w without-label`"
          :placeholder="readOnlyFeedback ? 'Отзыв' : 'Оставить отзыв'"
          :readonly="!!readOnlyFeedback"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          no-caps
          :label="`${!readOnlyFeedback ? 'Отмена' : 'Закрыть'}`"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          v-if="!readOnlyFeedback"
          flat
          no-caps
          label="Отправить"
          class="primary-btn"
          :disable="!stars"
          v-close-popup
          @click="sendUserFeedback"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { ref, onMounted, watch } from 'vue';

// services
import { useUtilsStore } from 'src/stores/utils-store';
import { SUCCESS_FEEDBACK_SENT } from 'src/constants/notifications';
import { DtoUserFeedback } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const emits = defineEmits<{ error: []; success: [msg: string]; hide: [] }>();
const props = defineProps<{ readOnlyFeedback?: DtoUserFeedback }>();
const utilsStore = useUtilsStore();
const stars = ref();
const feedback = ref();

const refresh = () => {
  stars.value = props.readOnlyFeedback?.stars ?? 0;
  feedback.value = props.readOnlyFeedback?.feedback ?? '';

  if (!stars.value) {
    utilsStore.getUserFeedback().then((data) => {
      stars.value = data?.stars ?? 0;
      feedback.value = data?.feedback ?? '';
    });
  }
};

const sendUserFeedback = () => {
  utilsStore
    .createUserFeedback({ stars: stars.value, feedback: feedback.value })
    .then(() => {
      emits('success', SUCCESS_FEEDBACK_SENT);
      refresh();
    })
    .catch(() => emits('error'));
};

onMounted(async () => refresh());
watch(
  () => props.readOnlyFeedback,
  (newFeedback) => {
    stars.value = newFeedback?.stars ?? 0;
    feedback.value = newFeedback?.feedback ?? '';
  },
);
</script>

<style scoped lang="scss">
:deep(.q-icon) {
  font-size: 49px !important;
}
:deep(.q-rating__icon) {
  text-shadow: none !important;
}

.q-dialog__inner > div {
  border-radius: 16px;
}

.q-rating {
  color: #ffc90a;
}
</style>
