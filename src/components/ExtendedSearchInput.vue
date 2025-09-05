<template>
  <div class="relative-position">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Поиск"
      style="font-size: 14px"
      class="search-input extended-search-select"
      ref="input"
      @input="
        () => {
          $emit('handle-input', searchQuery);
        }
      "
      @focus="toggleMenu"
      @blur="handleBlur"
    />
    <ul
      v-if="showingMenu && options.length"
      class="dropdown-menu"
      @mousedown.stop
      @mousedown.prevent
      @mouseup.stop
      @mouseup.prevent
    >
      <li v-for="option in options" :key="option.id">
        <router-link
          target="_blank"
          style="color: inherit; text-decoration: none"
          :to="`/${option.workspace_detail.slug}/projects/${option.project}/issues/${option.sequence_id}`"
        >
          <q-item>
            <q-item-section>
              <q-item-label>

                <div
                  class="abbriviated-text"
                  v-html="
                    `${String.fromCodePoint(
                      parseInt(option.project_detail.emoji),
                    )} <b>${option.project_detail.identifier}-${
                      option.sequence_id
                    }</b> ${option.name_highlighted}`
                  "
                ></div>
              </q-item-label>
              <q-item-label>
                <div v-html="option.desc_highlighted"></div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </router-link>
      </li>
      <div></div>
    </ul>
    <div v-if="showingMenu && options.length === 0" class="empty-dropdown-menu">
      <div v-show="loading && !options.length">
        <DefaultLoader :size="2" unit="em" />
      </div>
      <div v-show="!loading">Нет задач</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

export default defineComponent({
  name: 'ExtendedSearchInput',
  components: { DefaultLoader },
  props: ['options', 'loading'],
  emits: ['handle-input'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const search = ref('');
    const showingMenu = ref(false);
    const input = ref();

    const toggleMenu = () => {
      showingMenu.value = !showingMenu.value;
    };

    const handleBlur = () => {
      showingMenu.value = false;
    };
    return {
      search,
      showingMenu,
      toggleMenu,
      handleBlur,
      searchQuery,
      input,
    };
  },
});
</script>

<style scoped>
@media screen and (max-width: 760px) {
  .dropdown-menu {
    max-width: 80vw;
    max-height: 350px;
  }
}
.dropdown-menu {
  animation: slide-up 0.3s ease-out forwards;
}

@keyframes slide-up {
  from {
    max-height: 0;
  }
  to {
    max-height: 600px;
  }
}
</style>
