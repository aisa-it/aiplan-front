<template>
  <div class="mention-menu" :class="classPrevent">
    <template v-if="items.length">
      <v-btn
        v-for="(item, index) in items"
        :key="item.member.id"
        class="btn mention-menu__item"
        :class="{ 'is-selected': index === selectedIndex }"
        variant="text"
        block
        @click="selectItem(index)"
      >
        <div class="mention-menu__item-content">
          <v-avatar
            size="25"
            :class="{
              avatar: true,
              'none-avatar': !item.member.avatar_id,
            }"
          >
            <!-- TODO: getUrlFile — not migrated; showing initials for now -->
            <div class="mention-avatar-text">
              {{ handleMember(item.member) }}
            </div>
          </v-avatar>
          <span class="mention-menu__item-text">
            <span>{{ handleMember(item.member, true) }}&nbsp;</span>
            <span>({{ item.member.username }})</span>
          </span>
        </div>
      </v-btn>
    </template>
    <div v-else class="no-wrap">Нет результатов</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Editor } from '@tiptap/vue-3';
// TODO: aiplan / helpers — not migrated yet
// import aiplan from 'src/utils/aiplan';
// import { getUrlFile } from 'src/utils/helpers';

const props = defineProps<{
  items: Record<string, any>[];
  command: (payload: { id: string; label: any }) => void;
  query: string;
  editor: Editor | null;
}>();

const selectedIndex = ref(0);
const classPrevent = computed(() => {
  return (props.editor?.options as any)?.classPrevent;
});

const onKeyDown = ({ event }: { event: KeyboardEvent }) => {
  if (event.key === 'ArrowUp') {
    upHandler();
    return true;
  }

  if (event.key === 'ArrowDown') {
    downHandler();
    return true;
  }

  if (event.key === 'Enter') {
    enterHandler();
    return true;
  }

  return false;
};

const upHandler = () => {
  selectedIndex.value =
    (selectedIndex.value + props.items.length - 1) % props.items.length;
};

const downHandler = () => {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length;
};

const enterHandler = () => {
  selectItem(selectedIndex.value);
};

const selectItem = (index: number) => {
  const item = props.items[index];
  if (item) {
    props.command({
      id: item.member.username,
      label: item.member.email,
    });
  }
};

const autoSelect = () => {
  const fullMatchIndex = props.items.findIndex(
    (item) => item.member.username.toLowerCase() === props.query.toLowerCase(),
  );
  if (fullMatchIndex !== -1) {
    selectItem(fullMatchIndex);
  }
};

const handleMember = (member: any, isUserName?: boolean): string => {
  // TODO: aiplan.UserName — temporary local fallback
  const parts = [member?.first_name, member?.last_name].filter(Boolean);
  if (!parts.length && member?.username) parts.push(member.username);
  if (isUserName) return parts.join(' ');
  return parts.map((m: string) => m[0]).join(' ');
};

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0;
    autoSelect();
  },
);

defineExpose({ onKeyDown });
</script>

<style>
.tippy-box {
  max-width: 100% !important;
}
</style>
<style lang="scss" scoped>
.mention-menu {
  background: #fff;
  border: 1px solid #dde2ea;
  border-radius: 0.7rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.4rem;
  position: relative;
  font-size: 0.7rem;
  line-height: 1;
  text-align: center;

  &__item {
    background-color: transparent;
    display: flex;
    flex-wrap: nowrap;
    gap: 0.25rem;
    text-align: left;
    width: 100%;
    cursor: pointer;
    padding: 4px;
    min-height: fit-content;
    font-size: 0.7rem;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    justify-content: flex-start;
    height: auto;

    &:hover,
    &:hover.is-selected {
      background-color: #f0f0f0;
    }

    &.is-selected {
      background-color: #f0f0f0;
    }

    .mention-menu__item-content {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 0.25rem;
      text-align: left;
      max-width: 400px;
      width: 100%;
    }

    .mention-menu__item-text {
      display: flex;
      flex-wrap: wrap;
      gap: 0;
      line-height: 1.4;
    }
  }

  .none-avatar {
    background-color: #ccdbff;
    color: #3f75ff;
  }

  .mention-avatar-text {
    font-size: 0.6rem;
    line-height: 0.6rem;
    letter-spacing: 0.5px;
    text-align: center;
    display: flex;
    padding: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
