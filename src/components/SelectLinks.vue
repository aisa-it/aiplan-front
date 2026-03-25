<template>
  <div>
    <div class="row">
      <div class="col centered-horisontally">
        <div class="row items-center">
          <LinkIcon class="issue-icon" /> <span class="q-ml-sm">Ссылки</span>
        </div>
      </div>
      <div class="col flex justify-end">
        <q-btn
          v-if="isDemo ? isDemoUserValid() : !isDisabled"
          class="btn btn-only-icon-sm self-center q-mt-xs q-ml-xs"
          :style="isFullWidth ? 'flex-shrink: 0;' : ''"
          no-caps
          @click="isLinkOpenDialog = true"
        >
          <div class="full-w centered-horisontally justify-between">
            <span v-if="Screen.width > 720 && isFullWidth">Создать</span>
            <AddIcon />
            <q-tooltip v-if="!isFullWidth">Создать</q-tooltip>
          </div>
        </q-btn>
      </div>
    </div>
    <q-list class="q-mt-sm issue-links-wrapper">
      <LinkItem 
        v-for="link in links"
        :key="link.id"
        :link="link"
        :isDisabled="isDisabled"
        @update:link="openLinkDialog"
        @delete="openDeleteLinkDialog"
      />
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

// icons
import AddIcon from './icons/AddIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';

// components
import LinkDialog from './dialogs/LinkDialog.vue';
import ConfirmDeleteLinkDialog from './dialogs/ConfirmDeleteLinkDialog.vue';

//types
import { DtoIssueLinkLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Screen } from 'quasar';
import LinkItem from './LinkItem.vue';

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
  isFullWidth: {
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

const openLinkDialog = (link: DtoIssueLinkLight) => {
  linkToUpdate.value = link;
  isLinkOpenDialog.value = true;
};

const openDeleteLinkDialog = (link: DtoIssueLinkLight) => {
  linkToDelete.value = link;
  isConfirmOpen.value = true;
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

watch(
  () => isLinkOpenDialog.value,
  (newValue) => {
    if (!newValue) {
      linkToUpdate.value = undefined;
    }
  },
);
</script>
