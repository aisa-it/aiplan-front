<template>
  <div class="logs-container hide-scrollbar">
    <div v-for="item in content" :key="item.id" class="row no-wrap">
      <div class="col-3 q-mr-sm">
        {{ item.created_at ? formatDateTime(item.created_at) : 'NO_DATE' }}
      </div>
      <div>
        {{
          `[${item.type?.toUpperCase()}] function="${
            item.function_name
          }" task="${item.issue_detail?.name}" user="${
            item.user_detail?.email
          }" message="${item.lua_err ? item.lua_err : item.msg}"`
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//types
import { DtoRulesLog } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//utils
import { formatDateTime } from 'src/utils/time';

defineProps<{
  content: DtoRulesLog[];
}>();
</script>
