<template>
  <EditorTipTapV2
    editor-id="issue-editor"
    v-model="issueData.description_html"
    :read-only-editor="props.isReadonly"
    :can-edit="props.isAllowedToEdit"
    class="issue-panel__editor"
    :class="{ 'ny-theme': ny }"
    :class-prevent="props.isAutosave ? preventClickClass : ''"
    can-resize
    is-mention
    :members="projectMembers"
    :get-members-for-mention="getProjectMembersForMention"
    @get-editor="getEditor"
    @enable-editing="handleToggleEdit"
  />
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { Editor } from '@tiptap/vue-3';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
// stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUtilsStore } from 'src/stores/utils-store';
// components
import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';
// utils
import { useStickyState } from 'src/composables/useStickyState';

// stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const utilsStore = useUtilsStore();
useStickyState('.issue-panel__editor .html-editor__toolbar');

// store to refs
const { projectMembers } = storeToRefs(projectStore);
const { issueData } = storeToRefs(singleIssueStore);
const { ny } = storeToRefs(utilsStore);

const emits = defineEmits(['toggleEdit', 'getEditor']);
const props = defineProps(['isReadonly', 'isAutosave', 'isAllowedToEdit']);

// vars
const route = useRoute();
const editor = ref<Editor>();
const preventClickClass = 'prevent-click-issue-outside';

//methods
const getProjectMembersForMention = async (
  search: string,
): Promise<Array<DtoProjectMemberLight> | void> => {
  return await projectStore.getProjectMembersForMention(
    issueData.value,
    route.params.workspace as string,
    route.params.project as string,
    { offset: 0, limit: 4, search_query: search },
  );
};

const getEditor = (value: any) => {
  editor.value = value;
  emits('getEditor', value);
};

// emits
const handleToggleEdit = () => emits('toggleEdit');

watch(ny, (newVal) => {
  if (newVal) useStickyState('.issue-panel__editor .html-editor__toolbar');
}, { immediate: true });
</script>

<style scoped lang="scss">
.issue-panel__editor {
  overflow: visible !important;
}

:deep(.html-editor__toolbar) {
  width: 99%;
  position: sticky;
  z-index: 10;
  top: 50px;
  background-color: $bg-color;

  &.is-sticky {
    padding-top: 80px;
    transition: padding-top 0.3s ease-in;
  }

  &:not(.is-sticky) {
    transition: padding-top 0.1s ease-out;
  }
}

.ny-theme :deep(.html-editor__toolbar) {
  top: 0;
}
</style>
