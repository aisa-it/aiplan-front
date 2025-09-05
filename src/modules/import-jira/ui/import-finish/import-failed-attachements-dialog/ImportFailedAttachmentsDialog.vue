<template>
  <q-dialog ref="dialogRef">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <div class="row justify-between no-wrap centered-horisontally">
          <h6>Ошибка переноса вложений</h6>
          <div>
            <q-btn
              flat
              dense
              size="24px"
              padding="xs"
              @click="dialogRef.hide()"
            >
              <CloseIcon />
            </q-btn>
          </div>
        </div>
        <div style="max-height: 80vh; overflow: scroll">
          <div v-for="a in attachments" :key="a.attachment_id" class="q-mb-sm">
            <span>
              <b>{{ a.key }}</b> {{ a.name }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref } from 'vue';
// components
import CloseIcon from 'src/components/icons/CloseIcon.vue';
// interfaces
import { IssuesImportFailedAttachment } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// props
defineProps<{
  attachments: Array<IssuesImportFailedAttachment>;
}>();

// state
const dialogRef = ref();
</script>
