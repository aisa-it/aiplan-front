<template>
<q-item class="issue-link-card">
  <HintTooltip>
      {{ link.title }} <br />
      {{ link.url }}</HintTooltip
  >
  <LinkIcon class="q-mt-xs q-mr-xs" />
  <div class="row column" style="width: 100%">
      <q-item-label>
      <q-btn
        v-if="link.url"
        flat
        dense
        no-caps
        @click.stop="goToLink(link.url)"
        style="width: 100%"
      >
        <span class="abbriviated-text" style="text-align: start">
        {{ link.title }}
        </span>
      </q-btn>
      <span v-else class="abbriviated-text" style="text-align: start">
        {{ link.title }}
      </span>
      </q-item-label>
      <q-item-label v-if="link.created_at" caption lines="2" class="sub-text">
      Добавлено {{ formatDateTime(link.created_at) }}<br />
      <!--   {{ aiplan.UserName(l.created_by_detail).join(' ') }} -->
      </q-item-label>
  </div>
  <div class="row column q-ml-auto justify-between q-pl-sm">
    <q-btn
      v-if="!isDisabled"
      flat
      dense
      @click="
          () => {
          emit('update', link);
          }
      "
    >
      <EditIcon />
    </q-btn>
    <q-btn
      v-if="!isDisabled && !disableDelete"
      flat
      dense
      @click="
          () => {
          emit('delete', link);
          }
      "
    >
      <BinIcon color="#DC3E3E" />
    </q-btn>
  </div>
</q-item>
</template>

<script setup lang="ts">
// utils
import { formatDateTime } from 'src/utils/time';

import { DtoIssueLinkLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import BinIcon from './icons/BinIcon.vue';
import EditIcon from './icons/EditIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';

const props = defineProps<{
    link: DtoIssueLinkLight;
    isDisabled?: boolean;
    disableDelete?: boolean;
}>();

const emit = defineEmits<{
  update: [link: DtoIssueLinkLight];
  delete: [link: DtoIssueLinkLight];
}>();

const goToLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
</script>