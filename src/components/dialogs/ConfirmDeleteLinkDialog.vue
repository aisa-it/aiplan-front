<template>
  <q-dialog ref="dialogRef">
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление ссылки</h6>
        <span>
          Вы действительно хотите удалить ссылку "<b> {{ link?.title }} </b>" от
          {{ formatDateTime(link?.created_at) }}?<br />Ссылка будет удалена
          навсегда. Действие необратимо.</span
        >
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          dense
          no-caps
          class="secondary-btn"
          label="Отменить"
          v-close-popup
        />
        <q-btn
          flat
          dense
          no-caps
          class="delete-btn"
          label="Удалить"
          v-close-popup
          @click="$emit('delete')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// utils
import { formatDateTime } from 'src/utils/time';

export default defineComponent({
  name: 'ConfirmDeleteLinkDialog',
  emits: ['delete'],
  props: ['link'],
  setup() {
    return { formatDateTime };
  },
});
</script>
