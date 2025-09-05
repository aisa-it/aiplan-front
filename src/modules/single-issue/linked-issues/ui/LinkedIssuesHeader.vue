<template>
  <IssuesHeaderWrapper>
    <div class="flex no-wrap">
      <ToggleExpansionButton v-model="expanded" class="q-mr-sm" />
      <h6 class="flex items-center" style="margin: 0px !important">
        Связи
        <IssuesColorCountTitle
          :count="linkedIssuesCount"
          :badgeClass="'circle-badge-issue'"
        />
      </h6>
    </div>
    <q-btn
      v-if="hasPermissionByIssue"
      @click="emits('onAddClick')"
      no-caps
      class="btn-only-icon-sm q-ml-sm"
    >
      <AddIcon />
    </q-btn>
  </IssuesHeaderWrapper>
</template>
<script setup lang="ts">
// components
import AddIcon from 'src/components/icons/AddIcon.vue';
import IssuesColorCountTitle from 'src/components/IssuesColorCountTitle.vue';
import ToggleExpansionButton from 'src/components/buttons/ToggleExpansionButton.vue';
import IssuesHeaderWrapper from 'src/modules/single-issue/ui/components/IssuesHeaderWrapper.vue';

//core
import { computed } from 'vue';

const props = defineProps<{
  linkedIssuesCount: number;
  isExpanded: boolean;
  hasPermissionByIssue: boolean | 'author';
}>();

const emits = defineEmits(['update:isExpanded', 'onAddClick']);

const expanded = computed({
  get: () => props.isExpanded,
  set: (val: boolean) => emits('update:isExpanded', val),
});
</script>
