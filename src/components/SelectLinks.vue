<template>
  <div>
    <div class="row q-pt-md">
      <div class="col centered-horisontally">
        <div class="row items-center">
          <LinkIcon class="issue-icon" /> <span class="q-ml-sm">Ссылки</span>
        </div>
      </div>
      <div class="col flex justify-end">
        <q-btn
          v-if="isDemo ? isDemoUserValid() : !isDisabled"
          class="btn-only-icon-sm"
          @click="isLinkOpenDialog = true"
          ><AddIcon
        /></q-btn>
      </div>
    </div>
    <q-list class="q-mt-sm issue-links-wrapper">
      <q-item v-for="l in links" :key="l.id" class="issue-link-card">
        <HintTooltip>
          {{ l.title }} <br />
          {{ l.url }}</HintTooltip
        >
        <LinkIcon class="q-mt-xs q-mr-xs" />
        <div class="row column" style="width: 100%">
          <q-item-label>
            <q-btn
              v-if="l.url"
              flat
              dense
              no-caps
              @click.stop="goToLink(l.url)"
              style="width: 100%"
            >
              <span class="abbriviated-text" style="text-align: start">
                {{ l.title }}
              </span>
            </q-btn>
            <span v-else class="abbriviated-text" style="text-align: start">
              {{ l.title }}
            </span>
          </q-item-label>
          <q-item-label v-if="l.created_at" caption lines="2" class="sub-text">
            Добавлено {{ formatDateTime(l.created_at) }}<br />
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
                linkToUpdate = l;
                isLinkOpenDialog = true;
              }
            "
          >
            <EditIcon />
          </q-btn>
          <q-btn
            v-if="!isDisabled"
            flat
            dense
            @click="
              () => {
                linkToDelete = l;
                isConfirmOpen = true;
              }
            "
          >
            <BinIcon color="#DC3E3E" />
          </q-btn>
        </div>
      </q-item>
    </q-list>
    <ConfirmDeleteLinkDialog
      v-model="isConfirmOpen"
      :link="linkToDelete"
      @delete="deleteLink(linkToDelete.id)"
    />
    <LinkDialog
      v-model="isLinkOpenDialog"
      :link="linkToUpdate"
      @create="(link) => addLink(link)"
      @edit="editLink"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref, watch, PropType } from 'vue';

// stores
import { useUtilsStore } from 'src/stores/utils-store';

// utils
import { formatDateTime } from 'src/utils/time';

// icons
import AddIcon from './icons/AddIcon.vue';
import BinIcon from './icons/BinIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';
import EditIcon from './icons/EditIcon.vue';

// components
import LinkDialog from './dialogs/LinkDialog.vue';
import ConfirmDeleteLinkDialog from './dialogs/ConfirmDeleteLinkDialog.vue';

//types
import { DtoIssueLinkLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps({
  project: { type: Object, required: false },
  issueid: {
    type: String,
    required: false,
    default: '',
  },
  links: {
    type: Array as PropType<DtoIssueLinkLight[] | null>,
    required: false,
    default: () => [],
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});

const emit = defineEmits(['add', 'delete', 'edit']);

// stores
const utilsStore = useUtilsStore();
// store to refs
const { isDemo } = storeToRefs(utilsStore);

// vars
const isConfirmOpen = ref(false);
const isLinkOpenDialog = ref(false);
const linkToDelete = ref();
const linkToUpdate = ref<DtoIssueLinkLight | undefined>();

const isDemoUserValid = () => {
  if (
    (props.project?.current_user_membership?.role ?? props.project?.role) >= 15
  )
    return true;
  return false;
};

const deleteLink = async (linkID: string) => {
  emit('delete', linkID);
};

const addLink = (link: any) => {
  emit('add', link);
};

const editLink = (link: any) => {
  emit('edit', link);
};

const goToLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

watch(
  () => isLinkOpenDialog.value,
  (newValue) => {
    if (!newValue) {
      linkToUpdate.value = undefined;
    }
  },
);
</script>
