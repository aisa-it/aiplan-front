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

<script setup lang="ts">
import ReactionListItem from 'components/issue-panels/reaction/ReactionListItem.vue';

const props = defineProps<{
  reactionList: { id: string; reaction: string }[];
}>();

const emits = defineEmits<{
  'update-reaction': [string];
}>();

const handleClickReaction = (reactionValue: string) => {
  emits('update-reaction', reactionValue);
};
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
