<template>
  <NodeViewWrapper as="span" class="mention-node">
    <!-- v-if="userName" -->
    <span class="mention" @mouseenter="showMenu" @mouseleave="closeMenu">
      @{{ node.attrs.id }}
    </span>
    <q-menu
      ref="menuRef"
      fit
      transition-show="scale"
      class="mention-menu"
      no-focus
      no-refocus
    >
      <div>
        <div class="mention-popup">
          <q-avatar
            :size="'28px'"
            square
            :class="{
              avatar: true,
              'none-avatar': !avatarId,
              square: true,
            }"
          >
            <q-img
              v-if="avatarId"
              :src="getUrlFile(avatarId)"
              spinner-size="28px"
              class="mention-avatar"
              :class="{ 'none-avatar': !avatarId }"
            >
              <template v-slot:error>
                <div class="mention-avatar-text none-avatar">
                  {{ avatarText }}
                </div>
              </template>
            </q-img>
            <div v-else class="mention-avatar-text none-avatar">
              {{ avatarText }}
            </div>
          </q-avatar>
          <div class="full-w">
            <div>
              <span class="body-medium word-wrap full-w text-weight-bold">
                {{ userName }}
              </span>
            </div>
            <div>
              <span class="body-medium word-wrap full-w">
                {{ node.attrs.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </q-menu>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3';
import { ref, nextTick, watch } from 'vue';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';
import { getUrlFile } from 'src/utils/helpers';

const props = defineProps({
  editor: Object,
  node: Object,
  updateAttributes: Function,
  extension: Object,
  members: {
    type: Object,
    required: false,
  },
});

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { projectMembers } = storeToRefs(projectStore);
const { workspaceUsers } = storeToRefs(workspaceStore);
const avatarId = ref(null);
const userName = ref('');
const menuRef = ref(null);
const avatarText = ref('');

const showMenu = () => {
  nextTick(() => {
    if (menuRef.value) {
      menuRef.value.show();
    }
  });
};

const closeMenu = () => {
  if (menuRef.value) {
    menuRef.value.hide();
  }
};

watch(
  () => [workspaceUsers.value, projectMembers.value],
  () => {
    const allMembers = [...projectMembers.value, ...workspaceUsers.value];
    if (!allMembers.length) return;
    const matched = allMembers.find(
      (el) => el.member.username === props.node.attrs.id,
    );

    if (matched) {
      avatarId.value = matched.member.avatar_id;
      userName.value = `${matched.member.last_name} ${matched.member.first_name}`;
      avatarText.value =
        matched.member.last_name[0] + matched.member.first_name[0];
    } else {
      console.warn('User not found for:', props.node.attrs.id);
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.mention-node {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  position: relative;
}

.mention-popup {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  padding: 6px;
  width: fit-content;
  max-width: 90%;
}

.mention-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.none-avatar {
  background-color: #ccdbff;
}

.square {
  border-radius: 4px;
}

.body-medium {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-weight-bold {
  font-weight: 700;
}
</style>
