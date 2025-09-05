<template>
  <div class="mention-menu" :class="classPrevent">
    <template v-if="items.length">
      <q-btn
        v-for="(item, index) in items"
        class="btn mention-menu__item"
        :class="{ 'is-selected': index === selectedIndex }"
        no-caps
        :key="item.member.id"
        @click="selectItem(index)"
      >
        <div class="mention-menu__item-content">
          <q-avatar
            size="25px"
            :class="{
              avatar: true,
              'none-avatar': !item.member.avatar_id,
            }"
          >
            <q-img
              v-if="item.member.avatar_id"
              :src="getUrlFile(item.member.avatar_id)"
              spinner-size="25px"
              class="mention-avatar"
            >
              <template v-slot:error>
                <div class="mention-avatar-text none-avatar">
                  {{ handleMember(item.member) }}
                </div>
              </template>
            </q-img>
            <div v-else class="mention-avatar-text">
              {{ handleMember(item.member) }}
            </div>
          </q-avatar>
          <span class="mention-menu__item-text">
            <span>{{ handleMember(item.member, true) }}&nbsp;</span>
            <span>({{ item.member.username }})</span>
          </span>
        </div>
      </q-btn>
    </template>
    <div class="no-wrap" v-else>Нет результатов</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { Editor } from '@tiptap/vue-3';
// utils
import aiplan from 'src/utils/aiplan';
import { getUrlFile } from 'src/utils/helpers';

export default defineComponent({
  name: 'EditorMentionList',
  props: {
    items: {
      type: Array as PropType<Record<string, any>[]>,
      required: true,
    },
    command: {
      type: Function as PropType<(payload: { id: string; label: any }) => void>,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    editor: {
      type: Object as PropType<Editor | null>,
      required: true,
    },
  },

  setup(props) {
    const selectedIndex = ref(0);
    const classPrevent = computed(() => {
      return props.editor?.options.classPrevent;
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
        (item) =>
          item.member.username.toLowerCase() === props.query.toLowerCase(),
      );
      if (fullMatchIndex !== -1) {
        selectItem(fullMatchIndex);
      }
    };

    const handleMember = (member: any, isUserName?: boolean): string => {
      if (isUserName) {
        return aiplan.UserName(member).join(' ');
      }

      return aiplan
        .UserName(member)
        .map((m) => m[0])
        .join(' ');
    };

    watch(
      () => props.items,
      () => {
        selectedIndex.value = 0;
        autoSelect();
      },
    );

    return {
      onKeyDown,
      upHandler,
      selectItem,
      getUrlFile,
      downHandler,
      classPrevent,
      enterHandler,
      handleMember,
      selectedIndex,
    };
  },
});
</script>
<style>
.tippy-box {
  max-width: 100% !important;
}
</style>
<style lang="scss" scoped>
.mention-menu {
  background: $base;
  border: 1px solid $border-color;
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

    &:hover,
    &:hover.is-selected {
      background-color: $grey-4;
    }

    &.is-selected {
      background-color: $grey-4;
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

  .mention-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background-color: $base;
  }

  .none-avatar {
    background-color: #ccdbff;
    color: $primary;
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

.body--dark {
  .mention-menu {
    background: $night;

    &__item {
      background: $night;
      color: $extra-light;

      &:hover,
      &:hover.is-selected {
        color: $extra-light;
        background: $night;
      }

      &.is-selected {
        background: $night;
        :deep(.q-focus-helper) {
          background: currentColor;
          opacity: 0.15;
        }
      }
    }
  }
}
</style>
