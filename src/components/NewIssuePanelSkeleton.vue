<template>
  <q-card-section>
    <div class="row q-mb-xs">
      <q-skeleton type="QBtn" width="100px" height="40px" class="q-mr-sm" />
      <q-skeleton type="QInput" height="40px" style="flex: 1" />
    </div>
    <q-skeleton height="450px" class="q-my-md" />
  </q-card-section>
  <q-card-section class="row">
    <div class="col q-mr-md">
      <div v-for="n in 5" :key="n" class="row q-mb-md items-center">
        <q-skeleton type="circle" size="16px" class="q-mr-sm" />
        <div class="col">
          <q-skeleton type="text" width="30%" class="q-mb-xs" />
          <q-skeleton type="rect" height="16px" />
        </div>
      </div>
    </div>
    <q-separator vertical />
    <div class="col q-ml-md">
      <div v-for="n in 4" :key="n" class="row q-mb-md items-center">
        <q-skeleton type="circle" size="16px" class="q-mr-sm" />
        <div class="col">
          <q-skeleton type="text" width="30%" class="q-mb-xs" />
          <q-skeleton type="rect" height="16px" />
        </div>
      </div>
    </div>
  </q-card-section>
  <q-card-section>
    <q-skeleton height="100px" class="q-my-md" />
  </q-card-section>
  <q-card-actions
    class="flex w-100 q-px-md"
    style="justify-content: space-between"
  >
    <q-skeleton type="rect" width="200px" />
    <div class="row">
      <q-skeleton type="QBtn" width="100px" class="q-mr-sm" />
      <q-skeleton type="QBtn" width="100px" />
    </div>
  </q-card-actions>
</template>
