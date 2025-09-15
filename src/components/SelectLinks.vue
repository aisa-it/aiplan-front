<template>
  <div class="row q-pt-md">
    <div class="col centered-horisontally">
      <div class="row items-center">
        <LinkIcon class="issue-icon" /> <span class="q-ml-sm">Ссылки </span>
      </div>
    </div>
    <div class="col flex justify-end">
      <q-btn
        v-if="isDemo ? isDemoUserValid() : isDisabled === true"
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
      <LinkIcon class="q-mt-xs"></LinkIcon>
      <q-item-section>
        <q-item-label>
          <q-btn flat dense no-caps @click="goToLink(l.url)" style="width: 90%">
            <span class="abbriviated-text" style="text-align: start">
              {{ l.title }}
            </span>
          </q-btn>
        </q-item-label>
        <q-item-label caption lines="2" class="sub-text">
          Добавлено {{ formatDateTime(l.created_at) }}<br />
          {{ aiplan.UserName(l.created_by_detail).join(' ') }}
        </q-item-label>
      </q-item-section>
      <q-item-section side class="justify-between">
        <q-btn
          v-if="isDisabled === true"
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
          v-if="isDisabled === true"
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
      </q-item-section>
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
</template>

<script lang="ts">
// core
import { storeToRefs } from 'pinia';
import { defineComponent, ref, watch } from 'vue';

// stores
import { useUtilsStore } from 'src/stores/utils-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';

// icons
import AddIcon from './icons/AddIcon.vue';
import BinIcon from './icons/BinIcon.vue';
import LinkIcon from './icons/LinkIcon.vue';
import EditIcon from './icons/EditIcon.vue';

// components
import LinkDialog from './dialogs/LinkDialog.vue';
import ConfirmDeleteLinkDialog from './dialogs/ConfirmDeleteLinkDialog.vue';

import {
  SUCCESS_LINK_ADDING,
  SUCCESS_LINK_EDITING,
  SUCCESS_LINK_DELETING,
} from 'src/constants/notifications';

export default defineComponent({
  name: 'SelectLinks',
  props: {
    projectid: {
      type: String,
      required: true,
    },
    issueid: {
      type: String,
      required: true,
    },
    links: {
      type: Array || null,
      required: false,
      default: () => [],
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: () => false,
    },
  },
  emits: ['refresh'],
  components: {
    EditIcon,
    LinkIcon,
    AddIcon,
    BinIcon,
    ConfirmDeleteLinkDialog,
    LinkDialog,
  },
  setup(props, { emit }) {
    // stores
    const utilsStore = useUtilsStore();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const singleIssueStore = useSingleIssueStore();
    const { setNotificationView } = useNotificationStore();

    // store to refs
    const { isDemo } = storeToRefs(utilsStore);
    const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
    const { project, currentProjectID } = storeToRefs(projectStore);

    // vars
    const isConfirmOpen = ref(false);
    const isLinkOpenDialog = ref(false);
    const linkToDelete = ref();
    const linkToUpdate = ref<object | undefined>();

    const isDemoUserValid = () => {
      if (project.value?.current_user_membership?.role >= 15) return true;
      return false;
    };

    const deleteLink = async (linkID: string) => {
      singleIssueStore
        .issueLinkDelete(
          currentWorkspaceSlug.value,
          currentProjectID.value,
          props.issueid,
          linkID,
        )
        .then(() => emit('refresh'))
        .then(() =>
          setNotificationView({
            type: 'success',
            open: true,
            customMessage: SUCCESS_LINK_DELETING,
          }),
        );
    };

    const addLink = (link: any) => {
      singleIssueStore
        .issueLinkCreate(
          currentWorkspaceSlug.value,
          currentProjectID.value,
          props.issueid,
          link.url,
          link.title,
        )
        .then(() => emit('refresh'))
        .then(() =>
          setNotificationView({
            type: 'success',
            open: true,
            customMessage: SUCCESS_LINK_ADDING,
          }),
        );
    };

    const editLink = (link: any) => {
      singleIssueStore
        .issueLinkEdit(
          currentWorkspaceSlug.value,
          currentProjectID.value,
          props.issueid,
          link.url,
          link.title,
          link.id,
        )
        .then(() => emit('refresh'))
        .then(() =>
          setNotificationView({
            type: 'success',
            open: true,
            customMessage: SUCCESS_LINK_EDITING,
          }),
        );
    };

    const goToLink = (url: string) => {
      let fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.target = '_blank';
      document.body.appendChild(fileLink);
      fileLink.click();
    };

    watch(
      () => isLinkOpenDialog.value,
      (newValue) => {
        if (!newValue) {
          linkToUpdate.value = undefined;
        }
      },
    );

    return {
      aiplan,
      isDemo,
      addLink,
      goToLink,
      editLink,
      deleteLink,
      linkToDelete,
      linkToUpdate,
      isConfirmOpen,
      formatDateTime,
      isDemoUserValid,
      isLinkOpenDialog,
    };
  },
});
</script>
