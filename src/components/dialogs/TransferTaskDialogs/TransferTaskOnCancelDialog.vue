<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <div class="row centered-horisontally no-wrap">
          <h6 class="q-ma-md">Отмена переноса</h6>
        </div>
        <span> Вы уверены, что хотите отменить перенос задачи? </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup="2"
        />
        <q-btn
          flat
          no-caps
          label="Вернуться"
          class="primary-btn"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TransferTaskOnCancelDialog',
});
</script>
