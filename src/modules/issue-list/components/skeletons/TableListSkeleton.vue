<template>
  <q-markup-table
    style="position: absolute; z-index: 1000; width: 100%; box-shadow: none"
  >
    <thead>
      <tr>
        <th class="text-left" style="width: 150px">
          <q-skeleton animation="blink" type="text" />
        </th>
        <th class="text-right">
          <q-skeleton animation="blink" type="text" />
        </th>
        <th class="text-right">
          <q-skeleton animation="blink" type="text" />
        </th>
        <th class="text-right">
          <q-skeleton animation="blink" type="text" />
        </th>
        <th class="text-right">
          <q-skeleton animation="blink" type="text" />
        </th>
        <th class="text-right">
          <q-skeleton animation="blink" type="text" />
        </th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="row in rowCount" :key="row">
        <td class="text-left">
          <q-skeleton animation="blink" type="text" width="85px" />
        </td>
        <td class="text-right">
          <q-skeleton animation="blink" type="text" width="50px" />
        </td>
        <td class="text-right">
          <q-skeleton animation="blink" type="text" width="35px" />
        </td>
        <td class="text-right">
          <q-skeleton animation="blink" type="text" width="65px" />
        </td>
        <td class="text-right">
          <q-skeleton animation="blink" type="text" width="25px" />
        </td>
        <td class="text-right">
          <q-skeleton animation="blink" type="text" width="85px" />
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ rowCount: number }>(), {
  rowCount: 15,
});
</script>
