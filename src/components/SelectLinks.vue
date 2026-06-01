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
        @update="openLinkDialog"
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
import { ref, watch } from 'vue';

// stores
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';

// icons
import AddIcon from './icons/AddIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';

// components
import LinkDialog from './dialogs/LinkDialog.vue';
import ConfirmDeleteLinkDialog from './dialogs/ConfirmDeleteLinkDialog.vue';

//types
import {
  DtoIssueLinkLight,
  DtoProject,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Screen } from 'quasar';
import LinkItem from './LinkItem.vue';

const props = withDefaults(
  defineProps<{
    project?: DtoProject;
    issueid?: string;
    links?: DtoIssueLinkLight[];
    isDisabled?: boolean;
    isFullWidth?: boolean;
  }>(),
  {
    links: () => [],
    issueid: '',
  },
);

const emits = defineEmits<{
  add: [DtoIssueLinkLight];
  edit: [DtoIssueLinkLight];
  delete: [string];
}>();

// stores
const utilsStore = useUtilsStore();
const roleStore = useRolesStore();
// store to refs
const { isDemo } = storeToRefs(utilsStore);

// vars
const isConfirmOpen = ref(false);
const isLinkOpenDialog = ref(false);
const linkToDelete = ref();
const linkToUpdate = ref<DtoIssueLinkLight | undefined>();

const isDemoUserValid = () => roleStore.getProjectRole(props.project?.id) >= 15;

const openLinkDialog = (link: DtoIssueLinkLight) => {
  linkToUpdate.value = link;
  isLinkOpenDialog.value = true;
};

const openDeleteLinkDialog = (link: DtoIssueLinkLight) => {
  linkToDelete.value = link;
  isConfirmOpen.value = true;
};

const deleteLink = async (linkID: string) => {
  emits('delete', linkID);
};

const addLink = (link: DtoIssueLinkLight) => {
  emits('add', link);
};

const editLink = (link: DtoIssueLinkLight) => {
  emits('edit', link);
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
