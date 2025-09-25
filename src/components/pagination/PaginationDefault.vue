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

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { QSelectProps } from 'quasar';

export default defineComponent({
  name: 'PaginationDefault',
  emits: ['update:selectedPage', 'update:rowsPerPage', 'request'],
  props: {
    selectedPage: {
      type: Number,
      required: true,
      default: () => 1,
    },
    rowsPerPage: {
      type: Number,
      required: false,
      default: 10,
    },
    rowsNumber: {
      type: Number,
      required: true,
      default: 10,
    },
    maxPages: {
      type: Number,
      required: false,
      default: 6,
    },
    rowsPerPageOptions: {
      type: Array as PropType<Array<number>>,
      required: false,
      default: () => [10, 25, 50, 100],
    },
    showRowsPerPage: {
      type: Boolean,
      required: false,
      default: false,
    },
    labelRowsPerPage: {
      type: String,
      required: false,
      default: 'Строк на странице:',
    },
    menuSelf: {
      type: String as PropType<QSelectProps['menuSelf']>,
      required: false,
      default: 'top middle',
    },
    menuAnchor: {
      type: String as PropType<QSelectProps['menuAnchor']>,
      required: false,
      default: 'bottom middle',
    },
  },
  setup(props, { emit }) {
    const maxRowsNumber = computed(() => {
      return Math.ceil(props.rowsNumber / props.rowsPerPage);
    });

    const updateSelectedPage = (val: number) => {
      emit('update:selectedPage', val);
      emit('request');
    };

    const updateRowsPerPage = (val: number) => {
      console.log('lolololol');
      emit('update:rowsPerPage', val);
      emit('update:selectedPage', 1);
      emit('request');
    };

    return {
      maxRowsNumber,
      updateRowsPerPage,
      updateSelectedPage,
    };
  },
});
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
