div
<template>
  <q-select
    v-model="model"
    dense
    multiple
    clearable
    emit-value
    map-options
    :label="label"
    :options="groupedOptions"
    option-value="id"
    option-label="name"
    :popup-content-style="popupContentStyle"
    popup-content-class="inh-popup scrollable-content"
    class="base-selector q-mb-sm"
    :loading="loading"
    @update:model-value="onUpdate"
    @clear="onClear"
  >
    <template v-slot:selected>
      <div class="adaptive-tag">
        <template v-if="model.length">
          <q-chip
            v-for="t in model"
            :key="t"
            dense
            square
            :class="`tag q-my-none q-ml-xs`"
            removable
            @remove="() => removeTag(t)"
          >
            <q-badge
              rounded
              :style="
                'background-color: ' +
                (options.find((l) => l.id == t)?.color ?? 'red')
              "
              class="q-mr-xs"
            />
            <span
              class="abbriviated-text"
              :class="{ 'error-text': !options.find((l) => l.id == t)?.name }"
            >
              {{ options.find((l) => l.id == t)?.name ?? unavailableText }}
              <HintTooltip>
                {{ options.find((l) => l.id == t)?.name ?? unavailableText }}
              </HintTooltip>
            </span>
          </q-chip>
        </template>
      </div>
    </template>
    <template #option="scope">
      <div @click.stop v-bind="scope.itemProps" style="padding: 0px">
        <q-item-section @click.stop>
          <ExpansionItem
            item-name="filter-tags"
            full-open
            isDefaultOpen
            isOpenDisable
          >
            <template #header>
              <q-item-section>
                <span style="font-weight: 800">{{ scope.opt.label }}</span>
              </q-item-section>
            </template>
            <template #content>
              <q-item
                v-for="(option, index) in scope.opt.options"
                :key="index"
                clickable
                @click="updateSelected(option)"
              >
                <div style="display: flex; align-items: center">
                  <q-badge
                    rounded
                    class="q-mr-sm"
                    style="height: 12px; width: 12px"
                    :style="{ backgroundColor: option.value.color }"
                  />
                  <span
                    class="word-wrap"
                    style="width: 95%"
                    :class="{
                      'item-selected': modelValue.includes(option.value.id),
                    }"
                  >
                    {{ option.name }}
                  </span>
                </div>
              </q-item>
            </template>
          </ExpansionItem>
        </q-item-section>
      </div>
    </template>

    <template v-slot:before-options>
      <div class="input-search-tags">
        <q-input
          v-model="searchValue"
          label="Поиск"
          clearable
          dense
          class="base-input q-mb-sm"
          @update:model-value="(e) => emit('search', e?.toString())"
        />
      </div>
    </template>

    <template v-slot:no-option>
      <div class="input-search-tags">
        <q-input
          v-model="searchValue"
          label="Поиск"
          clearable
          dense
          class="base-input q-mb-sm"
          @update:model-value="(e) => emit('search', e?.toString())"
        />
      </div>
      <q-item>
        <q-item-section> Нет тегов </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import ExpansionItem from 'src/components/ExpansionItem.vue';
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  modelValue: any[];
  options: any[];
  searchedOptions?: any[] | null;
  projects: any[];
  popupContentStyle?: any;
  label?: string;
  loading?: boolean;
  search: string;
  unavailableText?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: any[]];
  remove: [value: string];
  search: [value?: string];
}>();

const model = ref([...props.modelValue]);
const searchValue = ref(props.search);

const groupedOptions = computed(() => {
  const options = props.searchedOptions ?? props.options;
  const groups = options.reduce((acc: Record<string, any>, tag: any) => {
    if (!acc[tag.project]) acc[tag.project] = [];
    acc[tag.project].push({
      name: tag.name,
      value: tag,
    });
    return acc;
  }, {});

  return Object.keys(groups).map((projectId) => ({
    label: props.projects.find((el) => el.id === projectId)?.name ?? '—',
    options: groups[projectId],
  }));
});

const updateSelected = (option: any) => {
  const id = option.value.id;
  const index = props.modelValue.findIndex((val) => val === id);
  const newValue = [...props.modelValue];

  if (index === -1) newValue.push(id);
  else newValue.splice(index, 1);

  emit('update:modelValue', newValue);
};

const onUpdate = (e: any[]) => {
  emit('update:modelValue', e ? e.map((el: any) => (el?.id ? el.id : el)) : []);
};

const onClear = () => {
  model.value = [];
};

const removeTag = (id: string) => {
  const updated = model.value.filter((t) => t !== id);
  onUpdate(updated);
};

watch(
  () => props.modelValue,
  (val) => (model.value = [...val]),
);

watch(
  () => props.search,
  (val) => (searchValue.value = val),
);
</script>
