<template>
  <div style="padding: 8px; display: flex; flex-direction: row; gap: 12px">
    <div v-for="i in 3" :key="i">
      <q-card
        v-for="i in 3"
        :key="i"
        style="
          max-width: 400px;
          border-radius: 16px;
          margin-bottom: 12px;
          box-shadow: none;
          border: 1px solid var(--dark-border-color);
        "
      >
        <q-item>
          <q-item-section>
            <q-item-label caption>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>
              <q-skeleton type="text" />
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-skeleton type="rect" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-skeleton type="rect" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="rect" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-skeleton type="rect" />
          </q-item-section>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>
          <q-item-section avatar>
            <q-skeleton type="QAvatar" />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-skeleton type="QChip" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="QChip" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="QChip" />
          </q-item-section>
          <q-item-section>
            <q-skeleton type="QChip" />
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </div>
</template>
