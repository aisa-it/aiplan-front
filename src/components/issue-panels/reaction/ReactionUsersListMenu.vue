<template>
  <q-menu
    :model-value="showMenu"
    no-focus
    no-refocus
    transition-show="scale"
    transition-hide="scale"
    no-parent-event
    @hide="handleHideMenu"
  >
    <q-list class="reaction-users-list">
      <q-item
        v-for="item in reactionUsersList"
        :key="item.id"
        class="reaction-users-list__item">
        <q-item-section side avatar>
          <q-avatar
            size="26px"
            class="avatar square reaction__avatar"
            :class="{'none-avatar': !item.user_detail.avatar_id}"
          >
            <q-img
              v-if="item.user_detail.avatar_id"
              :src="getUrlFile(item.user_detail.avatar_id)"
              spinner-size="26px"
              :style="'object-fit: cover; width: 100%; height: 100%; background-color: white;'"
            >
              <template v-slot:error>
                <div class="text-avatar">
                  {{ getUserInitials(item.user_detail) }}
                </div>
              </template>
            </q-img>
            <div
              v-else
              class="text-avatar"
            >
              {{ getUserInitials(item.user_detail) }}
            </div>
          </q-avatar>
        </q-item-section>
        <q-item-section class="reaction-users-list__item-name">
          {{ getUserName(item.user_detail) }}
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { getFirstSymbol, getUrlFile } from 'src/utils/helpers';

export default defineComponent({
  name: 'ReactionUsersListMenu',
  props: {
    showMenu: {
      type: Boolean,
      required: true,
      default: false,
    },
    usersList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['update:showMenu'],
  setup(props, { emit }) {
    const reactionUsersList = computed(() => {
      return props.usersList || []
    });

    const getUserInitials = (user: any) => {
      return `${getFirstSymbol(user.last_name)} ${getFirstSymbol(user.first_name)}`;
    };

    const getUserName = (user: any) => {
      return `${user.last_name} ${user.first_name}`;
    };

    const handleHideMenu = () => {
      emit('update:showMenu', false);
    };

    return {
      getUrlFile,
      getUserName,
      handleHideMenu,
      getUserInitials,
      reactionUsersList,
    }
  }
});
</script>

<style scoped lang="scss">
.reaction-users-list {
  max-width: 280px;
  max-height: 160px;
  min-height: 38px;
  padding-right: 8px;
  overflow-y: auto;


  .q-item__section--avatar {
    min-width: fit-content;
    padding: 0;
  }

  &__item {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    text-align: left;
    width: 100%;
    padding: 6px 8px;
    min-height: fit-content;
    font-size: 0.8rem;
    line-height: 1;
  }

  &__item-name {
    word-break: break-word;
  }
}
</style>
