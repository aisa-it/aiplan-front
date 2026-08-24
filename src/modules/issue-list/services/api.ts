import { ref } from 'vue';
import { PropertyTemplates } from '@aisa-it/aiplan-api-ts/src/PropertyTemplates';
import { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { getDictionaryRows } from 'src/modules/project-settings/dictionaries/services/api';

const propertyTemplatesApi = new (withInterceptors(PropertyTemplates))();

// типы шаблонов дополнительных параметров (id → type) для группировки по
// параметрам: по типу решаем, как показывать значение группы (например,
// boolean-«Флаг» — «Выбрано»/«Не выбрано», а не true/false)
export const propertyTemplateTypes = ref<Record<string, string>>({});

// названия строк справочников (id строки → value) для lookup-шаблонов:
// группы в группировке приходят с id строки, а заголовок должен показывать название
export const propertyLookupLabels = ref<
  Record<string, Record<string, string>>
>({});

// подгружает в фоне все строки справочника lookup-шаблона (с пагинацией),
// чтобы заголовок группы показывал название строки, а не её id
const loadDictionaryLabels = async (
  workspaceSlug: string,
  projectID: string,
  templateId: string,
  dictionaryId: string,
) => {
  const labels: Record<string, string> = {};
  const seen = new Set<string>();
  try {
    const PAGE_SIZE = 500;
    let offset = 0;
    while (true) {
      const { count, result } = await getDictionaryRows(
        workspaceSlug,
        projectID,
        dictionaryId,
        { offset, limit: PAGE_SIZE },
      );
      let added = 0;
      for (const row of result ?? []) {
        if (row?.id && row?.value && !seen.has(row.id)) {
          seen.add(row.id);
          labels[row.id] = row.value;
          added += 1;
        }
      }
      // выходим, когда строки кончились или собрали все
      if (
        added === 0 ||
        seen.size >= (count ?? 0) ||
        (result?.length ?? 0) < PAGE_SIZE
      ) {
        break;
      }
      offset += result?.length ?? 0;
    }
  } catch (e) {
    // без названий строк группировка не сломается — останутся id
    console.error('Не удалось загрузить строки справочника для группировки', e);
  }
  propertyLookupLabels.value[templateId] = labels;
};

export const getPropertyTemplates = async (
  workspaceSlug: string,
  projectID: string,
): Promise<DtoProjectPropertyTemplate[]> => {
  const response = await propertyTemplatesApi.getPropertyTemplateList(
    workspaceSlug,
    projectID,
  );
  const templates = response.data;
  for (const template of templates ?? []) {
    if (template?.id) propertyTemplateTypes.value[template.id] = template.type ?? '';
    // lookup-шаблон: подгружаем названия строк справочника для заголовков групп
    if (
      template?.type === 'lookup' &&
      template.id &&
      template.dictionary_id &&
      !propertyLookupLabels.value[template.id]
    ) {
      void loadDictionaryLabels(
        workspaceSlug,
        projectID,
        template.id,
        template.dictionary_id,
      );
    }
  }
  return templates;
};
