<template>
  <div
    class="pinned-card elevator-1"
    @click="emits('openPreview', card.sequence_id)"
  >
    <div class="pinned-card__header">
      <span class="pinned-card__issue-id">
        {{
          `${props.card?.project_detail?.identifier}-${props.card?.sequence_id}`
        }}
      </span>

      <p class="pinned-card__issue-name">
        <div class="abbriviated-text">
          {{ props.card?.name }}
        </div>
        <q-badge
          v-if="props.card?.draft"
          floating
          color="orange"
          style="left: 2px; right: auto; top: -6px"
          >Черновик</q-badge
        >
      </p>
    </div>

    <div class="pinned-card__chips">
      <div class="pinned-card__chip">
        <q-badge
          rounded
          class="q-mr-sm"
          :style="{ backgroundColor: props.card.state_detail.color }"
          style="height: 12px; width: 12px"
        /><span class="word-wrap" style="width: 95%">
          {{ props.card.state_detail.name }}
        </span>
      </div>

      <div v-if="props.card.assignee_details.length" style="padding-left: 10px">
        <AvatarImage
          v-for="(l, n) in props.card?.assignee_details"
          :style="{ zIndex: props.card?.assignee_details?.length - n + 2 }"
          class="overlapping"
          :key="l?.name"
          :tooltip="avatarText(l).join(' ')"
          :text="[avatarText(l)[0]?.at(0), avatarText(l)[1]?.at(0)].join(' ')"
          :image="l?.avatar_id"
          :member="l"
          @click.stop="
            router.push({
              path: `/${currentWorkspaceSlug}/user-activities/${props.card.assignee_details[n]?.id}`,
            })
          "
        />
      </div>

      <AvatarImage
        v-else
        :key="props.card.author_detail.id"
        :tooltip="avatarText(card.author_detail).join(' ')"
        :text="
          [
            avatarText(props.card.author_detail)[0]?.at(0),
            avatarText(props.card.author_detail)[1]?.at(0),
          ].join(' ')
        "
        :image="props.card.author_detail.avatar_id"
        :member="props.card.author_detail"
        @click.stop="
          router.push({
            path: `/${currentWorkspaceSlug}/user-activities/${props.card.author_detail.id}`,
          })
        "
      />
      <ParentIssueChip
        v-if="isParent"
        :row="props.card"
        :target="user.theme?.open_in_new ? '_blank' : '_self'"
        style="padding: 0px 8px"
      />

      <QuantityChip
        :type="'attachments'"
        :value="props.card?.attachment_count"
      />
    </div>
    <IssueContextMenu :row="props.card" unpin />
  </div>
</template>

<script setup lang="ts">
import ParentIssueChip from 'src/components/ParentIssueChip.vue';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import AvatarImage from 'src/components/AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import QuantityChip from 'src/components/QuantityChip.vue';
import { useRouter } from 'vue-router';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';

const router = useRouter();
const { user } = storeToRefs(useUserStore());
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());

const props = defineProps<{ card: any }>();
const avatarText = aiplan.UserName;

const isParent = computed((): boolean => {
  return !!props.card?.parent && !!props.card?.parent_detail?.sequence_id;
});

const emits = defineEmits(['refresh', 'updateTable', 'openPreview']);
</script>

<style scoped lang="scss">
.pinned-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 8px;
  max-width: 387px;
  width: 100%;
  max-height: 142px;
  height: 100%;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--dark-border-color);
  cursor: pointer;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
  }

  &__issue-id {
    font-weight: 600;
    color: var(--text-color);
  }

  &__issue-name {
    padding-top: 4px;
    color: var(--sub-text-color);
  }

  &__chips {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__chip {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 0 12px;
    height: 32px;
  }
}
</style>
