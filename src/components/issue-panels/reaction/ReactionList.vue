<template>
  <div class="reaction-list" v-show="reactionList?.length">
    <template v-for="reaction in reactionList" :key="reaction.id">
      <ReactionListItem
        :reaction-item="reaction"
        @click-reaction="handleClickReaction(reaction.reaction)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ReactionListItem from 'components/issue-panels/reaction/ReactionListItem.vue';

export default defineComponent({
  name: 'ReactionList',
  components: { ReactionListItem },
  props: {
    reactionList: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  emits: ['update-reaction'],
  setup(props, { emit }) {
    const handleClickReaction = (reactionValue: string) => {
      emit('update-reaction', reactionValue);
    };

    return {
      handleClickReaction,
    };
  },
});
</script>

<style lang="scss">
.reaction-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  .reaction {
    background-color: $primary-light;
    padding: 0 2px;

    .reaction__avatar:not(:first-child) {
      margin-left: -7px;
    }
  }
}

.body--light {
  .reaction-list {
    .reaction {
      .none-avatar {
        background-color: $bg-light !important;
      }
    }
  }
}

.body--dark {
  .reaction-list {
    .reaction {
      background-color: $dark;

      .none-avatar {
        background-color: $primary-light !important;
      }
    }
  }
}
</style>
