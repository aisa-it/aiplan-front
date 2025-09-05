<template>
  <q-dialog ref="dialogRef">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Закрыть создание проекта</h6>
        <span class="text-base">
          Вы уверены, что хотите закрыть окно? Все внесенные данные будут
          утеряны.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          dense
          no-caps
          class="secondary-btn"
          label="Вернуться"
          v-close-popup
        />
        <q-btn
          flat
          dense
          no-caps
          class="primary-btn"
          label="Закрыть"
          v-close-popup
          @click="$emit('close')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConfirmCloseProjectCreateDialog',
  emits: ['close'],
  setup() {
    return {};
  },
});
</script>
