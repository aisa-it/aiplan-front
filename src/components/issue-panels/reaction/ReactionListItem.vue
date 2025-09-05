<template>
  <q-btn
    dense
    rounded
    class="reaction"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <span>
      {{ reactionItemData.reaction }}
    </span>
    <div v-if="reactionItemData.count <= 2" class="flex q-ml-xs">
      <q-avatar
        v-for="(user, userIndex) in reactionUsersList"
        :key="user.id"
        size="23px"
        class="avatar square reaction__avatar"
        :class="{ 'none-avatar': !user.user_detail?.avatar_id }"
        :style="{ zIndex: reactionUsersList.length - userIndex }"
      >
        <q-img
          v-if="user.user_detail?.avatar_id"
          :src="getUrlFile(user.user_detail?.avatar_id)"
          spinner-size="23px"
          :style="'object-fit: cover; width: 100%; height: 100%; background-color: white;'"
        >
          <template v-slot:error>
            <div class="text-avatar">
              {{ getUserInitials(user.user_detail) }}
            </div>
          </template>
        </q-img>
        <div v-else class="text-avatar">
          {{ getUserInitials(user.user_detail) }}
        </div>
      </q-avatar>
    </div>
    <div v-else>
      <q-avatar size="23px" class="avatar square none-avatar">
        <div class="text-avatar">
          {{ reactionItemData.count }}
        </div>
      </q-avatar>
    </div>

    <ReactionUsersListMenu
      v-model:show-menu="showReactionUsersListMenu"
      :users-list="reactionUsersList"
    />
  </q-btn>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { getFirstSymbol, getUrlFile } from 'src/utils/helpers';
import ReactionUsersListMenu from 'components/issue-panels/reaction/ReactionUsersListMenu.vue';

export default defineComponent({
  name: 'ReactionListItem',
  components: { ReactionUsersListMenu },
  props: {
    reactionItem: {
      type: Object,
      required: true,
      default: () => {
        return {};
      },
    },
  },
  emits: ['click-reaction'],
  setup(props, { emit }) {
    //vars
    const showReactionUsersListMenu = ref<boolean>(false);
    const longPressTimeout = ref<number | null>(null);
    const isLongPress = ref<boolean>(false);

    // computed
    const reactionItemData = computed(() => props.reactionItem);

    const reactionUsersList = computed(() => {
      return reactionItemData.value.users || [];
    });

    // function
    const getUserInitials = (user: any) => {
      return `${getFirstSymbol(user?.last_name)} ${getFirstSymbol(
        user?.first_name,
      )}`;
    };

    const handleClick = (event) => {
      if (isLongPress.value) {
        event.preventDefault();
        event.stopPropagation();

        return;
      }

      emit('click-reaction');
      showReactionUsersListMenu.value = false;
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      showReactionUsersListMenu.value = true;
    };

    const handleTouchStart = () => {
      isLongPress.value = false;
      longPressTimeout.value = setTimeout(() => {
        isLongPress.value = true;
        showReactionUsersListMenu.value = true;
      }, 300);
    };

    const handleTouchEnd = (event) => {
      if (longPressTimeout.value) {
        clearTimeout(longPressTimeout.value);
      }

      if (isLongPress.value) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleTouchCancel = () => {
      if (longPressTimeout.value) {
        clearTimeout(longPressTimeout.value);
      }
    };

    return {
      getUrlFile,
      handleClick,
      handleTouchEnd,
      getUserInitials,
      reactionItemData,
      handleTouchStart,
      handleTouchCancel,
      reactionUsersList,
      handleContextMenu,
      showReactionUsersListMenu,
    };
  },
});
</script>
