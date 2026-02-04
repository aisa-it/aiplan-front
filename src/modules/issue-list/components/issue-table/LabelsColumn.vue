<template>
  <q-td :props="rowInfo">
    <div class="row no-wrap" style="gap: 4px">
      <q-badge
        v-for="l in rowInfo.value"
        :key="l?.name"
        class="q-ml-xs overflow-hidden"
        :style="['background-color: ' + l.color, 'max-width: 200px']"
      >
        <span class="abbriviated-text">
          {{ l?.name }}
          <HintTooltip>
            {{ l?.name }}
          </HintTooltip>
        </span>
      </q-badge>
    </div>
  </q-td>
</template>

<script setup lang="ts">
defineProps<{
  rowInfo: any;
}>();
</script>
