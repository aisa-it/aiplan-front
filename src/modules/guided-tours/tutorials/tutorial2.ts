import { Step } from '../types/step';
import { useGuiderStore } from '../guider-store';

export const STEP_NUM = 2;

export const steps: Step[] = [
  {
    el: '[data-tour="issue-table"]',
    title: 'Ваш центр управления задачами',
    text: 'Здесь живут все задачи вашего проекта. Хотите послушать про возможности списка задач?',
    activeButtonText: 'Хочу послушать!',
    is_skip: true,
    placement: {
      mode: 'inside',
      primary: 'left',
      align: 'end',
      offset: {
        x: 16,
        y: -16,
      },
    },
  },
  {
    el: '[data-tour="filter-list"]',
    title: 'Настройте вид под себя',
    text: 'Нажмите сюда, чтобы превратить стандартный список в идеальный для вас инструмент.',
    activeButtonText: 'Показать настройки',
    padding: 8,
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'start',
    },
  },
  {
    el: '[data-tour="view-options"]',
    title: 'Как вам удобнее видеть задачи?',
    text: 'Переключайтесь между списком (для деталей) и доской (Kanban, для визуального потока).',
    activeButtonText: 'Далее',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
    onEnter: () => {
      useGuiderStore().openFiltersList();
    },
  },
  {
    el: '[data-tour="columns-options"]',
    title: 'Оставляйте только важное',
    text: 'Решите, какие данные видеть (статус, приоритет, исполнитель). Скрывайте лишнее и меняйте порядок колонок.',
    activeButtonText: 'Понял',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="group-options"]',
    title: 'Упорядочьте задачи по смыслу',
    text: 'Автоматически сортируйте задачи по статусу, исполнителю, сроку или любому другому параметру.',
    activeButtonText: 'Здорово',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="status-options"]',
    title: 'Сфокусируйтесь на нужном этапе',
    text: 'Показывайте только «В работе» или скройте «Выполнено». Оставляйте в поле зрения только актуальные задачи',
    activeButtonText: 'Ясно',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="task-general-settings"]',
    title: 'Тонкая настройка',
    textList: [
      'Скрыть подзадачи: Уберите из общего списка мелкие шаги, чтобы видеть только основные цели.',
      'Черновики: Показывайте или скрывайте неопубликованные задачи.',
      'Пустые группы: Решите, нужно ли видеть группы, в которых пока нет задач.',
    ],
    activeButtonText: 'Дальше',
    padding: 4,
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="task-personal-settings"]',
    title: 'Персональный фокус',
    textList: [
      'Только активные: Сразу скройте всё завершённое и отменённое.',
      'Мои задачи (3 тумблера): В один клик оставьте в списке только те задачи, где вы — исполнитель, наблюдатель или автор.',
    ],
    activeButtonText: 'Удобно!',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'center',
    },
  },
  {
    el: '[data-tour="refresh-filters"]',
    title: 'Не бойтесь экспериментировать!',
    text: 'Запутались в настройках? Просто нажмите эту кнопку, чтобы вернуть вид задач к состоянию по умолчанию.',
    activeButtonText: 'Всё понятно, начать работу!',
    placement: {
      mode: 'outside',
      primary: 'left',
      align: 'start',
    },
    onLeave: () => {
      useGuiderStore().closeFiltersList();
    },
  },
];
