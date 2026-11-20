<template>
  <section class="space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="flex items-center gap-2 text-sm font-medium">
        <LinkIcon class="shrink-0 text-icon" aria-hidden="true" />
        {{ t('issues.columns.link_count') }}
      </h3>
      <v-btn
        type="button"
        color="icon"
        density="comfortable"
        size="small"
        variant="text"
        icon
        :aria-label="t('issues.create.links.add')"
        :title="t('issues.create.links.add')"
        :disabled="disabled"
        @click="openLinkDialog()"
      >
        <AddIcon aria-hidden="true" />
      </v-btn>
    </div>

    <ul v-if="links.length" class="grid gap-2.5">
      <li
        v-for="(link, index) in links"
        :key="link.id ?? index"
        class="flex min-w-0 items-start gap-1 rounded-lg border border-border px-4 py-2"
      >
        <LinkIcon class="mt-1 shrink-0 text-icon" aria-hidden="true" />
        <div class="min-w-0 flex-1">
          <a
            v-if="getLinkHref(link.url)"
            :href="getLinkHref(link.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="block truncate rounded px-1 py-1 text-sm leading-6 font-medium text-default hover:bg-[rgba(var(--v-theme-text),0.08)]"
            :title="[link.title, link.url].filter(Boolean).join('\n')"
          >
            {{ link.title || link.url }}
          </a>
          <span
            v-else
            class="block truncate px-1 py-1 text-sm leading-6"
            :title="link.title || link.url"
          >
            {{ link.title || link.url || '—' }}
          </span>
          <time
            v-if="link.created_at"
            :datetime="link.created_at"
            class="mt-1 block text-sm text-secondary"
          >
            {{
              t('issues.create.links.addedAt', {
                date: formatDateTime(link.created_at),
              })
            }}
          </time>
        </div>
        <div class="flex shrink-0 flex-col">
          <v-btn
            type="button"
            icon
            color="icon"
            size="32"
            variant="text"
            :aria-label="t('issues.create.links.edit')"
            :disabled="disabled"
            @click="openLinkDialog(index)"
          >
            <EditIcon aria-hidden="true" />
          </v-btn>
          <v-btn
            type="button"
            icon
            size="32"
            variant="text"
            :aria-label="t('issues.create.links.remove')"
            :disabled="disabled"
            @click="openRemoveDialog(index)"
          >
            <BinIcon color="#DC3E3E" aria-hidden="true" />
          </v-btn>
        </div>
      </li>
    </ul>
  </section>

  <v-dialog
    v-model="isLinkDialogOpen"
    width="760"
    :aria-labelledby="linkDialogTitleId"
  >
    <v-card color="surface" class="link-dialog-card">
      <form novalidate @submit.stop.prevent="saveLink">
        <h2 :id="linkDialogTitleId" class="link-dialog-title">
          {{
            editingIndex === undefined
              ? t('issues.create.links.addTitle')
              : t('issues.create.links.editTitle')
          }}
        </h2>
        <div class="link-dialog-fields">
          <v-text-field
            v-model="url"
            type="url"
            :label="t('issues.create.links.url')"
            :error-messages="urlError"
            :disabled="disabled"
            class="link-dialog-field"
            color="issue-dialog-action"
            density="comfortable"
            variant="underlined"
            hide-details="auto"
          />
          <v-text-field
            v-model="title"
            :label="t('common.fields.name')"
            :error-messages="titleError"
            :disabled="disabled"
            class="link-dialog-field"
            color="issue-dialog-action"
            density="comfortable"
            variant="underlined"
            hide-details="auto"
          />
        </div>
        <v-card-actions class="link-dialog-actions">
          <v-btn
            type="button"
            class="link-dialog-action"
            color="issue-dialog-action"
            variant="outlined"
            width="110"
            height="40"
            @click="isLinkDialogOpen = false"
          >
            {{ t('common.actions.cancel') }}
          </v-btn>
          <v-btn
            type="submit"
            class="link-dialog-action"
            color="issue-dialog-action"
            variant="flat"
            width="110"
            height="40"
            :disabled="disabled"
          >
            {{
              editingIndex === undefined
                ? t('common.actions.add')
                : t('common.actions.save')
            }}
          </v-btn>
        </v-card-actions>
      </form>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="isRemoveDialogOpen"
    max-width="460"
    :aria-labelledby="removeDialogTitleId"
  >
    <v-card class="rounded-xl">
      <v-card-title :id="removeDialogTitleId">
        {{ t('issues.create.links.remove') }}
      </v-card-title>
      <v-card-text class="wrap-break-word">
        {{ t('issues.create.links.removeQuestion', { title: removingTitle }) }}
      </v-card-text>
      <v-card-actions class="justify-end gap-2">
        <v-btn
          type="button"
          variant="outlined"
          @click="isRemoveDialogOpen = false"
        >
          {{ t('common.actions.cancel') }}
        </v-btn>
        <v-btn
          type="button"
          color="error"
          :disabled="disabled"
          @click="removeLink"
        >
          {{ t('common.actions.delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DtoIssueLinkLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';

import AddIcon from '@/components/icons/AddIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import LinkIcon from '@/components/icons/LinkIcon.vue';
import BinIcon from '@/components/sidebar/icons/BinIcon.vue';
import { formatDateTime } from '@/utils/time';

const props = defineProps<{ disabled?: boolean }>();
const links = defineModel<DtoIssueLinkLight[]>({ required: true });
const { t } = useI18n();

const isLinkDialogOpen = ref(false);
const isRemoveDialogOpen = ref(false);
const linkDialogTitleId = useId();
const removeDialogTitleId = useId();
const editingIndex = ref<number>();
const removingIndex = ref<number>();
const title = ref('');
const url = ref('');
const submitted = ref(false);

const removingTitle = computed(() => {
  if (removingIndex.value === undefined) return '';
  const link = links.value[removingIndex.value];
  return link?.title || link?.url || '';
});
const titleError = computed(() =>
  submitted.value && !title.value.trim()
    ? t('issues.create.links.requiredTitle')
    : '',
);
const urlError = computed(() =>
  submitted.value && !getLinkHref(url.value.trim())
    ? t('issues.create.links.invalidUrl')
    : '',
);

function getLinkHref(value?: string) {
  if (!value || !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return undefined;

  try {
    const parsed = new URL(value);
    if (['data:', 'javascript:', 'vbscript:'].includes(parsed.protocol))
      return undefined;
    return parsed.hostname ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

function openLinkDialog(index?: number) {
  const link = index === undefined ? undefined : links.value[index];
  editingIndex.value = index;
  title.value = link?.title ?? '';
  url.value = link?.url ?? '';
  submitted.value = false;
  isLinkDialogOpen.value = true;
}

function saveLink() {
  if (props.disabled) return;
  submitted.value = true;
  if (titleError.value || urlError.value) return;

  const link = { title: title.value.trim(), url: url.value.trim() };
  const index = editingIndex.value;
  links.value =
    index === undefined
      ? [...links.value, { ...link, created_at: new Date().toISOString() }]
      : links.value.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...link } : item,
        );
  isLinkDialogOpen.value = false;
}

function openRemoveDialog(index: number) {
  removingIndex.value = index;
  isRemoveDialogOpen.value = true;
}

function removeLink() {
  if (props.disabled) return;
  links.value = links.value.filter((_, index) => index !== removingIndex.value);
  isRemoveDialogOpen.value = false;
}
</script>

<style scoped>
.link-dialog-card {
  border-radius: 16px;
  box-shadow: var(--v-issue-dialog-shadow);
}

.link-dialog-title {
  padding: 16px 16px 14px;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.15px;
}

.link-dialog-fields {
  display: grid;
  gap: 20px;
  padding: 0 16px 22px;
}

.link-dialog-field :deep(.v-field:not(.v-field--error) .v-field-label) {
  color: var(--color-secondary);
  opacity: 1;
}

.link-dialog-field
  :deep(
    .v-field:not(.v-field--focused, .v-field--error) .v-field__outline::before
  ) {
  border-color: rgb(var(--v-theme-border));
  opacity: 1;
}

.link-dialog-field
  :deep(
    .v-field:hover:not(.v-field--focused, .v-field--error, .v-field--disabled)
      .v-field__outline::before
  ) {
  border-color: rgb(var(--v-theme-issue-dialog-action));
}

.link-dialog-actions {
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
}

.link-dialog-action {
  min-width: 0;
  border-radius: 8px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.75px;
  text-transform: none;
}
</style>
