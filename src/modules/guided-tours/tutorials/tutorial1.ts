import { type Step } from '../types/step';

export const STEP_NUM = 1;

export const steps: Step[] = [
  {
    el: '',
    title: 'Добро пожаловать в АИПлан! 🚀',
    text: 'Это ваш новый помощник для командной работы и управления задачами. Хотите за 2 минуты увидеть, как здесь всё устроено?',
    activeButtonText: 'Да, конечно!',
    is_skip: true,
    placement: {
      mode: 'screen',
      primary: 'center',
      align: 'center',
    },
  },
  {
    el: '[data-tour="fast-navigation"]',
    title: 'Быстрая навигация',
    text: 'Переключайтесь между рабочими пространствами, списком задач и документами в один клик.',
    activeButtonText: 'Далее',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'start',
    },
  },
  {
    el: '[data-tour="sidebar"]',
    title: 'Всё под рукой',
    text: 'Здесь живут ваши проекты. А ещё отсюда можно создавать формы, запускать звонки, заглянуть в инструкцию или сразу написать нам.',
    activeButtonText: 'Понятно',
    placement: {
      mode: 'outside',
      primary: 'right',
      align: 'center',
    },
  },
  {
    el: '[data-tour="profile"]',
    title: 'Всё для вашего удобства',
    text: 'Настройте аккаунт, внешний вид (например, тёмную тему) и уведомления так, как комфортно именно вам.',
    activeButtonText: 'Хорошо',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="create-issue"]',
    title: 'Создавайте задачи в один клик!',
    text: 'Видите эту большую кнопку? Она поможет вам мгновенно добавить новую задачу, не теряя фокус на работе.',
    activeButtonText: 'Удобно!',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="search"]',
    title: 'Найдите что угодно за секунды',
    text: 'Потеряли задачу или документ? Глобальный поиск с фильтрами мгновенно всё найдёт!',
    activeButtonText: 'Отлично!',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="notifications"]',
    title: 'Будьте в курсе событий',
    text: 'Здесь будут все важные оповещения от системы и вашей команды. Ничего не пропустите!',
    activeButtonText: 'Ясно',
    padding: 4,
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
  {
    el: '[data-tour="conference"]',
    title: 'Встречи без хлопот',
    text: 'Видеозвонки! Создавайте собственную комнату для совещаний.',
    activeButtonText: 'Здорово!',
    placement: {
      mode: 'outside',
      primary: 'bottom',
      align: 'end',
    },
  },
];
