<template>
  <q-td class="name-row" :props="rowInfo" @contextmenu.prevent>
    <div class="name-row__wrapper">
      <q-btn
        no-caps
        flat
        style="padding: 0 4px"
        :to="`/${$route.params.workspace}/projects/${rowInfo.row?.project}/issues/${rowInfo.row.sequence_id}`"
        :target="user.theme?.open_in_new ? '_blank' : '_self'"
        @click.prevent.stop="emits('openPreview', rowInfo.row)"
      >
        <span class="abbriviated-text" style="text-align: left">
          {{ rowInfo.value }}
        </span>
        <HintTooltip> {{ rowInfo.value }}</HintTooltip>
        <q-badge
          v-if="rowInfo.row.draft"
          floating
          color="orange"
          style="left: 2px; right: auto; top: -6px"
          >Черновик</q-badge
        >
      </q-btn>

      <ParentIssueChip
        v-if="isParent"
        :row="rowInfo.row"
        :target="user.theme?.open_in_new ? '_blank' : '_self'"
        class="parent-issue-chip"
        @click.prevent.stop="emits('openPreview', rowInfo.row.parent_detail)"
      />
    </div>
  </q-td>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

// stores
import { useUserStore } from 'src/stores/user-store';

// components
import ParentIssueChip from 'src/components/ParentIssueChip.vue';
import { computed } from 'vue';

const props = defineProps<{
  rowInfo: any;
}>();

const emits = defineEmits<{
  openPreview: [value: any];
}>();
const { user } = storeToRefs(useUserStore());
const route = useRoute();

const isParent = computed((): boolean => {
  return (
    !!props.rowInfo.row.parent &&
    !!props.rowInfo.row?.parent_detail?.sequence_id
  );
});
</script>

<style scoped lang="scss">
.name-row {
  padding: 8px 0px;
  max-width: 25rem;
  min-width: 25rem;

  &__wrapper {
    display: grid;
    grid-template-columns: 100%;
    gap: 16px;
  }
  &__wrapper:has(.parent-issue-chip) {
    grid-template-columns: 80% 20%;
  }
}
</style>
