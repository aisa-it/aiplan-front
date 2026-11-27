<template>
  <q-menu max-height="85vh" :offset="[0, 6]">
    <div class="aql-help">
      <div class="aql-help__title">Язык запросов AQL</div>

      <section class="aql-help__section">
        <button
          type="button"
          class="aql-help__heading"
          :aria-expanded="opened.query"
          @click="opened.query = !opened.query"
        >
          <span>Запрос</span>
          <q-icon :name="opened.query ? 'expand_less' : 'expand_more'" />
        </button>
        <div v-show="opened.query" class="aql-help__body">
          <ul class="aql-help__notes">
            <li>
              Условие: <code>поле оператор значение</code>. Условия соединяются
              <code>AND</code>, <code>OR</code>, <code>NOT</code> и группируются
              скобками.
            </li>
            <li>
              Сортировка в конце:
              <code>ORDER BY поле [ASC|DESC], ...</code>. Без неё задачи идут по
              убыванию номера, а при поиске по тексту — по релевантности.
            </li>
            <li>
              Значения с пробелами берутся в кавычки:
              <code>status = "В работе"</code>.
            </li>
            <li>
              Регистр ключевых слов и имён полей не важен, имена функций пишутся
              как в примерах.
            </li>
          </ul>
        </div>
      </section>

      <section class="aql-help__section">
        <button
          type="button"
          class="aql-help__heading"
          :aria-expanded="opened.examples"
          @click="opened.examples = !opened.examples"
        >
          <span>Примеры</span>
          <q-icon :name="opened.examples ? 'expand_less' : 'expand_more'" />
        </button>
        <div v-show="opened.examples" class="aql-help__body">
          <div
            v-for="example in examples"
            :key="example.code"
            class="aql-help__example"
          >
            <div class="aql-help__example-text">{{ example.text }}</div>
            <code class="aql-help__example-code">{{ example.code }}</code>
          </div>
        </div>
      </section>

      <section class="aql-help__section">
        <button
          type="button"
          class="aql-help__heading"
          :aria-expanded="opened.operators"
          @click="opened.operators = !opened.operators"
        >
          <span>Операторы</span>
          <q-icon :name="opened.operators ? 'expand_less' : 'expand_more'" />
        </button>
        <div v-show="opened.operators" class="aql-help__body">
          <div class="aql-help__table">
            <template v-for="row in operators" :key="row.code">
              <code>{{ row.code }}</code>
              <span>{{ row.text }}</span>
            </template>
          </div>
        </div>
      </section>

      <section class="aql-help__section">
        <button
          type="button"
          class="aql-help__heading"
          :aria-expanded="opened.fields"
          @click="opened.fields = !opened.fields"
        >
          <span>Поля</span>
          <q-icon :name="opened.fields ? 'expand_less' : 'expand_more'" />
        </button>
        <div v-show="opened.fields" class="aql-help__body">
          <template v-for="group in fieldGroups" :key="group.title">
            <div class="aql-help__group">
              {{ group.title }}: <code>{{ group.operators }}</code>
            </div>
            <div class="aql-help__table">
              <template v-for="row in group.rows" :key="row.code">
                <code>{{ row.code }}</code>
                <span>{{ row.text }}</span>
              </template>
            </div>
          </template>
          <ul class="aql-help__notes aql-help__notes--after">
            <li>
              Параметр задачи указывается по названию в кавычках:
              <code>"Название параметра" = значение</code>. Числа и даты можно
              сравнивать, флажок равен <code>true</code> или <code>false</code>,
              в строках <code>~</code> ищет подстроку.
            </li>
            <li>
              Даты: <code>2024-01-31</code>, <code>"2024-01-31 15:30"</code> или
              сдвиг от текущего момента: <code>-7d</code>, <code>-2w</code>,
              <code>-1M</code>, <code>-1y</code>, <code>-3h</code>,
              <code>-30m</code> (<code>M</code> — месяцы, <code>m</code> —
              минуты).
            </li>
            <li v-for="list in nameLists" :key="list.title">
              {{ list.title }}
              <div class="aql-help__names">
                <code v-for="name in list.names" :key="name">{{ name }}</code>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="aql-help__section">
        <button
          type="button"
          class="aql-help__heading"
          :aria-expanded="opened.functions"
          @click="opened.functions = !opened.functions"
        >
          <span>Функции</span>
          <q-icon :name="opened.functions ? 'expand_less' : 'expand_more'" />
        </button>
        <div v-show="opened.functions" class="aql-help__body">
          <div class="aql-help__table">
            <template v-for="row in functions" :key="row.code">
              <code>{{ row.code }}</code>
              <span>{{ row.text }}</span>
            </template>
          </div>
        </div>
      </section>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

// справочные разделы свёрнуты: без них шпаргалка открывается без долгой прокрутки
const opened = reactive({
  query: true,
  examples: true,
  operators: false,
  fields: false,
  functions: false,
});

interface HelpRow {
  code: string;
  text: string;
}

interface FieldGroup {
  title: string;
  operators: string;
  rows: HelpRow[];
}

interface NameList {
  title: string;
  names: string[];
}

const operators: HelpRow[] = [
  { code: '=  !=', text: 'равно, не равно' },
  { code: '<  <=  >  >=', text: 'сравнение дат и чисел' },
  { code: '~  !~', text: 'поиск по тексту, от 3 символов' },
  {
    code: 'IN (...)  NOT IN (...)',
    text: 'одно из значений списка, до 100 значений',
  },
  { code: 'IS EMPTY  IS NOT EMPTY', text: 'поле не заполнено, заполнено' },
];

const fieldGroups: FieldGroup[] = [
  {
    title: 'Значения и связи',
    operators: '=  !=  IN  NOT IN',
    rows: [
      { code: 'project', text: 'проект: идентификатор или id' },
      { code: 'workspace', text: 'пространство: идентификатор или id' },
      { code: 'issue', text: 'задача: ключ вида PRJ-123 или id' },
      {
        code: 'parent',
        text: 'родительская задача: ключ или id; parent = "PRJ-1" — прямые подзадачи',
      },
      { code: 'status', text: 'статус: название или id' },
      {
        code: 'statusGroup',
        text: 'группа статусов: backlog, unstarted, started, completed, cancelled',
      },
      { code: 'type', text: 'тип задачи: название или id' },
      { code: 'priority', text: 'приоритет: urgent, high, medium, low' },
      { code: 'labels', text: 'метка: название или id' },
      { code: 'sprint', text: 'спринт: название или id' },
      {
        code: 'author  assignee  watcher',
        text: 'автор, исполнитель, наблюдатель: логин, почта или имя',
      },
      { code: 'links', text: 'задача связана с указанной' },
      { code: 'blocks', text: 'задача блокирует указанную' },
      { code: 'blockedBy', text: 'задачу блокирует указанная' },
    ],
  },
  {
    title: 'Даты',
    operators: '=  !=  <  <=  >  >=',
    rows: [
      { code: 'created  updated', text: 'создана, обновлена' },
      { code: 'completed', text: 'завершена' },
      { code: 'startDate  dueDate', text: 'дата начала, срок исполнения' },
    ],
  },
  {
    title: 'Текст',
    operators: '~  !~',
    rows: [
      {
        code: 'title  description  comment',
        text: 'название, описание, комментарии',
      },
      { code: 'text', text: 'название, описание и комментарии сразу' },
    ],
  },
  {
    title: 'Только проверка на пустоту',
    operators: 'IS EMPTY  IS NOT EMPTY',
    rows: [{ code: 'attachments', text: 'вложения' }],
  },
];

const nameLists: NameList[] = [
  {
    title: 'Проверку IS EMPTY понимают параметры задачи и поля:',
    names: [
      'description',
      'priority',
      'labels',
      'assignee',
      'watcher',
      'parent',
      'sprint',
      'completed',
      'startDate',
      'dueDate',
      'links',
      'blocks',
      'blockedBy',
      'attachments',
    ],
  },
  {
    title: 'Сортировать можно по полям:',
    names: [
      'issue',
      'title',
      'status',
      'priority',
      'author',
      'assignee',
      'watcher',
      'labels',
      'created',
      'updated',
      'completed',
      'startDate',
      'dueDate',
      'sub_issues_count',
      'link_count',
      'linked_issues_count',
      'attachment_count',
    ],
  },
  {
    title: 'Работают и имена из Jira:',
    names: [
      'reporter',
      'creator',
      'summary',
      'key',
      'issuetype',
      'due',
      'resolved',
      'statusCategory',
    ],
  },
];

const functions: HelpRow[] = [
  { code: 'currentUser()', text: 'текущий пользователь' },
  { code: 'now()', text: 'текущий момент' },
  {
    code: 'startOfDay()  endOfDay()',
    text: 'начало и конец дня; так же …Week (с понедельника), …Month, …Year',
  },
  {
    code: 'startOfMonth(-1)  endOfDay(-1d)',
    text: 'со сдвигом: на число периодов или на длительность',
  },
  {
    code: 'childrenOf("PRJ-1")',
    text: 'вся ветка подзадач на любую глубину, одним списком без уровней; ветка идёт только через видимые вам задачи; только после IN. Прямые подзадачи — parent = "PRJ-1"',
  },
  {
    code: 'linkedTo("PRJ-1")',
    text: 'задачи, связанные с указанной; только после IN',
  },
];

const examples: HelpRow[] = [
  {
    text: 'Мои незавершённые задачи, сначала важные',
    code: 'assignee = currentUser() AND statusGroup IN (unstarted, started) ORDER BY priority DESC',
  },
  {
    text: 'Срочные задачи проекта, созданные с начала прошлого месяца',
    code: 'project = PRJ AND priority IN (urgent, high) AND created >= startOfMonth(-1)',
  },
  {
    text: 'Упоминание в названии, описании или комментариях за последнюю неделю',
    code: 'text ~ "ошибка оплаты" AND updated >= -7d',
  },
  {
    text: 'Просроченные задачи без исполнителя',
    code: 'dueDate < now() AND assignee IS EMPTY AND statusGroup NOT IN (completed, cancelled) ORDER BY dueDate',
  },
  {
    text: 'Подзадачи задачи, кроме помеченных меткой',
    code: 'issue IN childrenOf("PRJ-1") AND NOT labels = bug',
  },
  {
    text: 'Задачи с параметром и вложениями',
    code: '"Площадка" = "Пром" AND attachments IS NOT EMPTY',
  },
];
</script>

<style scoped lang="scss">
.aql-help {
  width: 620px;
  max-width: 95vw;
  padding: 16px 20px 20px 20px;
  background-color: $bg-color;
  color: $text-color;
  font-size: 13px;
  line-height: 20px;

  code {
    padding: 1px 4px;
    border-radius: 4px;
    background-color: $tiptap-codeblock-bg-color;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.aql-help__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.aql-help__section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid $dark-border-color;
}

.aql-help__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $sub-text-color;
}

.aql-help__heading .q-icon {
  font-size: 18px;
}

.aql-help__body {
  margin-top: 6px;
}

.aql-help__notes {
  margin: 0;
  padding-left: 18px;

  li + li {
    margin-top: 4px;
  }

  &--after {
    margin-top: 10px;
  }
}

.aql-help__names {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.aql-help__group {
  margin: 10px 0 4px 0;
  color: $sub-text-color;
}

.aql-help__body > .aql-help__group:first-child {
  margin-top: 0;
}

.aql-help__table {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  gap: 4px 12px;
  align-items: baseline;

  code {
    justify-self: start;
  }
}

.aql-help__example + .aql-help__example {
  margin-top: 6px;
}

.aql-help__example-text {
  color: $sub-text-color;
}

.aql-help__example-code {
  display: block;
  padding: 6px 8px !important;
  line-height: 18px;
}
</style>
