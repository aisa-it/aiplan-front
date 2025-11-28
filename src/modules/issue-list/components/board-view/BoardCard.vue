<template>
  <div class="board-card">
    <div class="board-card__header">
      <span style="font-size: 12px">
        {{ `${card?.project_detail?.identifier}-${card?.sequence_id}` }}
      </span>
      <span style="font-size: 12px">
        {{ formatDateTime(card?.created_at) }}
      </span>
    </div>

    <div class="name-row">
      <q-btn
        v-if="projectProps?.columns_to_show?.includes('name')"

        no-caps
        flat
        style="padding: 0 4px"
        @click="emits('openPreview', card.sequence_id)"
      >
        <span class="abbriviated-text" style="text-align: left">
          {{ card?.name }}
        </span>
        <HintTooltip> {{ card?.name }}</HintTooltip>
        <q-badge
          v-if="card?.draft"
          floating
          color="orange"
          style="left: 2px; right: auto; top: -6px"
          >Черновик</q-badge
        >
      </q-btn>

      <ParentIssueChip
        v-if="isParent"
        :row="card"
        :target="user.theme?.open_in_new ? '_blank' : '_self'"
        class="parent-issue-chip"
        @click.prevent.stop="
          emits('openPreview', card.parent_detail?.sequence_id)
        "
      />
    </div>

    <div class="selectors">
      <SelectPriority
        v-if="projectProps?.columns_to_show?.includes('priority')"
        style="width: inherit"
        :workspace-slug="card.workspace_detail?.slug"
        :projectid="card?.project"
        :issueid="card?.id"
        :priority="card?.priority ?? 'Нет'"
        :issue="card"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(
            card,
            project,
            'change-issue-primary',
          )
        "
        @refresh="
          () => {
            emits('updateTable', 'priority', card, entity);
          }
        "
      />
      <SelectDate
        v-if="projectProps?.columns_to_show?.includes('target_date')"
        style="width: inherit"
        :workspace-id="card.workspace_detail?.slug"
        :projectid="card?.project"
        :issueid="card?.id"
        :date="card?.target_date"
        :issue="card"
        :is-disabled="
          !rolesStore.hasPermissionByIssue(
            card,
            project,
            'change-issue-primary',
          )
        "
        @refresh="emits('updateTable', 'targetDate', card, entity)"
      />
    </div>

    <div class="selectors">
      <SelectStatus
        v-if="projectProps?.columns_to_show?.includes('state')"
        style="width: auto !important"
        :projectid="card?.project"
        :issueid="card?.id"
        :status="card?.state_detail"
        :issue="card"
        :states-from-cache="statesCache[card.project]"
        :isDisabled="
          !rolesStore.hasPermissionByIssue(card, project, 'change-issue-status')
        "
        @refresh="
          (status) => {
            emits(
              'updateTable',
              'state',
              Object.assign(card, { state_detail: status }),
              entity,
            );
          }
        "
      />

      <div class="row">
        <AvatarImage
          v-if="projectProps?.columns_to_show?.includes('author')"
          class="q-mr-lg"
          :key="card.author_detail.id"
          :tooltip="avatarText(card.author_detail).join(' ')"
          :text="
            [
              avatarText(card.author_detail)[0]?.at(0),
              avatarText(card.author_detail)[1]?.at(0),
            ].join(' ')
          "
          :image="card.author_detail.avatar_id"
          :member="card.author_detail"
          @click.stop="
            $router.push({
              path: `/${currentWorkspaceSlug}/user-activities/${card.author_detail.id}`,
            })
          "
        />

        <div
          v-if="projectProps?.columns_to_show?.includes('assignees')"
          style="position: relative"
        >
          <AvatarImage
            v-for="(l, n) in card?.assignee_details"
            :style="{ zIndex: card?.assignee_details?.length - n + 2 }"
            class="overlapping"
            :key="l?.name"
            :tooltip="avatarText(l).join(' ')"
            :text="[avatarText(l)[0]?.at(0), avatarText(l)[1]?.at(0)].join(' ')"
            :image="l?.avatar_id"
            :member="l"
            @click.stop="
              $router.push({
                path: `/${currentWorkspaceSlug}/user-activities/${card.assignee_details[n]?.id}`,
              })
            "
          >
          </AvatarImage>
        </div>
      </div>
    </div>

    <div class="flex">
      <QuantityChip :type="'sub-issues'" :value="card?.sub_issues_count" />
      <QuantityChip
        :type="'linked_issues_count'"
        :value="card?.linked_issues_count"
      />
      <QuantityChip :type="'links'" :value="card?.link_count" />
      <QuantityChip :type="'attachments'" :value="card?.attachment_count" />
    </div>
    <IssueContextMenu :row="card" />
  </div>
</template>

<script setup lang="ts">
import ParentIssueChip from 'src/components/ParentIssueChip.vue';
import { formatDateTime } from 'src/utils/time';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SelectDate from 'src/components/SelectDate.vue';
import SelectPriority from 'src/components/SelectPriority.vue';
import { useStatesStore } from 'src/stores/states-store';
import SelectStatus from 'src/components/SelectStatus.vue';
import AvatarImage from 'src/components/AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import QuantityChip from 'src/components/QuantityChip.vue';
import { useProjectStore } from 'src/stores/project-store';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';
import { useRolesStore } from 'src/stores/roles-store';
import { useGroupedIssues } from '../../composables/useGroupedIssues';

const { user } = storeToRefs(useUserStore());
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
const route = useRoute();
const props = defineProps<{ card: any; entity: any }>();
const rolesStore = useRolesStore();
const avatarText = aiplan.UserName;

const isParent = computed((): boolean => {
  return !!props.card?.parent && !!props.card?.parent_detail?.sequence_id;
});

const emits = defineEmits(['refresh', 'updateTable', 'openPreview']);
const { statesCache } = storeToRefs(useStatesStore());
const { projectProps, project } = storeToRefs(useProjectStore());
</script>

<style scoped lang="scss">
.board-card {
  border-radius: 16px;
  border: 1px solid var(--dark-border-color);
  min-height: 240px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}

.name-row {
  display: grid;
  grid-template-columns: 100%;
  width: 380px;
  gap: 16px;
}
.name-row:has(.parent-issue-chip) {
  grid-template-columns: 80% 20%;
}

.selectors {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
}
</style>
