import { hasObjectChanges } from 'src/utils/helpers';
import { ref, computed, toValue, type MaybeRefOrGetter } from 'vue';

interface UseFormChangesOptions<Source, Result> {
  transform?: (data: Source) => Result;
  immediate?: boolean;
}

/**
 * Composable для отслеживания изменений в форме или объекте.
 * Использует стратегию "снимка" (snapshot): создает глубокую копию начального состояния
 * и сравнивает её с текущим состоянием.
 *
 * @template Source - Тип исходного объекта.
 * @template Result - Тип трансформированного объекта (снимка).
 * @param source - Реактивный объект или геттер для отслеживания.
 * @param options - Опции конфигурации.
 * @param options.transform - Функция для выбора/нормализации данных перед сравнением.
 * @param options.immediate - Если true, вызывает init() сразу при создании.
 *
 * @returns Объект, содержащий:
 * - `hasChanges`: ComputedRef<boolean> - True, если текущее состояние отличается от снимка.
 * - `init`: () => void - Функция для создания нового снимка текущего состояния.
 * - `original`: Ref<Result | null> - Снимок исходного состояния.
 */
export function useFormChanges<Source = any, Result = Source>(
  source: MaybeRefOrGetter<Source>,
  options: UseFormChangesOptions<Source, Result> = {},
) {
  const original = ref<Result | null>(null);
  const { transform = (val: any) => val, immediate = false } = options;

  const getTransformedState = (): Result => {
    const raw = toValue(source);
    return JSON.parse(JSON.stringify(transform(raw)));
  };

  const init = () => {
    original.value = getTransformedState();
  };

  if (immediate) {
    init();
  }

  const hasChanges = computed(() => {
    if (original.value === null) return false;
    const current = getTransformedState();
    return hasObjectChanges(
      original.value as Record<string, any>,
      current as Record<string, any>,
    );
  });

  return {
    hasChanges,
    original,
    init,
  };
}
