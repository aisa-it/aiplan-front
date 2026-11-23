<template>
  <div class="flex min-w-0 gap-3 overflow-hidden p-2">
    <div v-for="column in 3" :key="column" class="flex w-[min(400px,100%)] shrink-0 flex-col gap-2">
      <v-skeleton-loader type="heading" class="rounded-2xl border border-border" />
      <v-skeleton-loader
        v-for="card in 3"
        :key="card"
        type="list-item-two-line, list-item-avatar-two-line"
        class="min-h-60 rounded-2xl border border-border"
      />
    </div>
  </div>
</template>
