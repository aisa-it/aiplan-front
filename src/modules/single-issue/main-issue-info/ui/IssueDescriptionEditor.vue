<template>
  <EditorTipTapV2
    editor-id="issue-editor"
    v-model="issueData.description_html"
    :read-only-editor="props.isReadonly"
    :can-edit="props.isAllowedToEdit"
    class="issue-panel__editor"
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
import { ref } from 'vue';
import { useRoute } from 'vue-router';
// stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
// components
import { DtoProjectMemberLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import EditorTipTapV2 from 'src/components/editorV2/EditorTipTapV2.vue';

// stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();

// store to refs
const { projectMembers } = storeToRefs(projectStore);
const { issueData } = storeToRefs(singleIssueStore);

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
}
</style>
