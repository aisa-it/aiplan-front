<template>
  <div class="pagination-default">
    <q-pagination
      flat
      boundary-links
      direction-links
      class="pagination-default__page"
      :max-pages="maxPages"
      :model-value="selectedPage"
      :max="maxRowsNumber"
      @update:model-value="updateSelectedPage"
      @click.stop
    />

    <div v-if="showRowsPerPage" class="pagination-default__per-page-options">
      <span>{{ labelRowsPerPage }}</span>
      <q-select
        dense
        options-dense
        :model-value="rowsPerPage"
        :options="rowsPerPageOptions"
        borderless
        :menu-self="menuSelf"
        :menu-anchor="menuAnchor"
        popup-content-class="scrollable-content"
        @update:model-value="updateRowsPerPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { QSelectProps } from 'quasar';

const props = withDefaults(
  defineProps<{
    selectedPage?: number;
    rowsPerPage?: number;
    rowsNumber?: number;
    maxPages?: number;
    rowsPerPageOptions?: number[];
    showRowsPerPage?: boolean;
    labelRowsPerPage?: string;
    menuSelf?: QSelectProps['menuSelf'];
    menuAnchor?: QSelectProps['menuAnchor'];
  }>(),
  {
    selectedPage: 1,
    rowsPerPage: 10,
    rowsNumber: 10,
    maxPages: 6,
    rowsPerPageOptions: () => [10, 25, 50, 100],
    showRowsPerPage: false,
    labelRowsPerPage: 'Строк на странице:',
    menuSelf: 'top middle',
    menuAnchor: 'bottom middle',
  },
);

const emits = defineEmits<{
  'update:selectedPage': [number];
  'update:rowsPerPage': [number];
  request: [{ page: number; rowsPerPage?: number }, string];
}>();

const maxRowsNumber = computed(() => {
  return Math.ceil(props.rowsNumber / props.rowsPerPage);
});

const updateSelectedPage = (val: number) => {
  emits('update:selectedPage', val);
  emits('request', { page: val }, 'selectedPage');
};

const updateRowsPerPage = (val: number) => {
  emits('update:rowsPerPage', val);
  emits('update:selectedPage', 1);
  emits('request', { page: 1, rowsPerPage: val }, 'rowsPerPage');
};
</script>

<style lang="scss">
.pagination-default {
  display: flex;
  align-items: center;
  gap: 8px;

  .q-btn {
    min-width: 2em !important;
    min-height: 2em !important;
    padding: 0 !important;
    font-size: 12px;

    &:last-child,
    &:first-child {
      display: none;
    }

    &:before,
    &:after {
      display: none;
    }

    .q-icon {
      width: 24px;
      height: 24px;
      font-size: 16px;
    }

    .q-focus-helper {
      display: none;
    }

    &.disabled {
      opacity: 1 !important;
    }
  }

  .q-pagination__middle {
    .q-btn {
      display: block;
    }
  }

  &__per-page-options {
    display: flex;
    align-items: center;
    gap: 16px;

    .q-field--dense {
      min-height: 24px;

      .q-field__control {
        min-height: inherit;
      }

      .q-field__native {
        min-height: 24px;
        padding: 0;
      }

      .q-field__marginal {
        height: inherit;
      }
    }
  }

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-content: center;
  }
}

.body--dark {
  .pagination-default {
    .q-btn {
      color: $extra-light !important;
      background-color: $night !important;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);

      &:hover,
      &:focus-visible {
        color: $primary !important;
        background-color: #3a486e !important;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      }
    }

    .q-btn[aria-current='true'] {
      color: $primary !important;
    }

    .q-btn.disabled {
      color: $dark !important;
      background-color: $night !important;
    }
  }
}

.body--light {
  .pagination-default {
    .q-btn {
      color: $dark !important;
      background-color: $base !important;

      &:hover,
      &:focus-visible {
        color: $primary !important;
        transition: color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        background-color: #f0f4ff !important;
      }
    }

    .q-btn[aria-current='true'] {
      color: $primary !important;
    }

    .q-btn.disabled {
      color: $extra-light !important;
      background-color: $base !important;
    }
  }
}
</style>
