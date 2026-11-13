// У vanta нет типов: ни в самом пакете, ни отдельным @types/vanta. Без этого
// файла TypeScript не знает, что вернёт import('vanta/dist/vanta.clouds.min'),
// и единственный выход — @ts-ignore. Мы описываем минимум: импорт возвращает
// функцию, которая по настройкам создаёт анимацию облаков. Форму этой функции
// описывает useVantaClouds (модуль конференции) — там её единственное
// использование.
declare module 'vanta/dist/vanta.clouds.min' {
  import type { VantaCloudsFactory } from '@/modules/conference/composables/useVantaClouds';
  const clouds: VantaCloudsFactory;
  export default clouds;
}
