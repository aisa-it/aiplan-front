import assert from 'node:assert/strict';
import { test } from 'node:test';
import { useIssueListController } from '../model/useIssueListController.ts';
import {
  getMinimumTargetDate,
  getTargetDateValue,
  isValidTargetDate,
} from '../utils/issue-date.helpers.ts';

test('срок: прошедшие даты и время раньше 15 минут недоступны', () => {
  const now = new Date(2026, 8, 3, 12, 30, 20);
  const today = new Date(2026, 8, 3);
  assert.equal(isValidTargetDate(new Date(2026, 8, 2), '23:59', now), false);
  assert.equal(isValidTargetDate(today, '12:44', now), false);
  assert.equal(isValidTargetDate(today, '12:45', now), true);
  assert.equal(isValidTargetDate(new Date(2026, 8, 4), '00:00', now), true);
});

test('срок: минимум корректно переходит через полночь и границу года', () => {
  const now = new Date(2026, 11, 31, 23, 50);
  assert.equal(
    getMinimumTargetDate(now).format('YYYY-MM-DD HH:mm'),
    '2027-01-01 00:05',
  );
  assert.equal(isValidTargetDate(new Date(2027, 0, 1), '00:04', now), false);
  assert.equal(isValidTargetDate(new Date(2027, 0, 1), '00:05', now), true);
});

test('срок: неполный ввод, невалидное время и дата за пределом диапазона', () => {
  const now = new Date(2026, 8, 3);
  assert.equal(isValidTargetDate(null, '12:00', now), false);
  assert.equal(isValidTargetDate(now, null, now), false);
  assert.equal(isValidTargetDate(now, '24:00', now), false);
  assert.equal(isValidTargetDate(now, '12:60', now), false);
  assert.equal(isValidTargetDate(new Date(2037, 0, 1), '12:00', now), false);
  assert.equal(isValidTargetDate(new Date(2036, 11, 31), '23:59', now), true);
});

test('срок отправляется в UTC с сохранением выбранного локального времени', () => {
  const date = new Date(2026, 8, 4);
  assert.equal(
    getTargetDateValue(date, '15:30').toISOString(),
    new Date(2026, 8, 4, 15, 30).toISOString(),
  );
});

function fixture({
  allowed = true,
  fail = false,
  removeAfterUpdate = false,
} = {}) {
  let rows = [
    { id: 'issue', state: 'open', priority: 'low', attachment_count: 3 },
  ];
  const calls = [];
  const controller = useIssueListController(
    {
      scope: {
        type: 'project',
        workspaceSlug: 'ws',
        projectId: 'project',
        projectIdentifier: 'TEST',
      },
      async load(filters, query) {
        calls.push(['load', query.page, query.sortBy]);
        return { items: rows, total: rows.length };
      },
    },
    {
      query: {
        page: 2,
        rowsPerPage: 25,
        sortBy: 'priority',
        descending: true,
        hideSubIssues: false,
        onlyActive: false,
      },
      filters: {},
      columns: ['sequence_id', 'priority', 'state'],
    },
    {
      canEdit: () => allowed,
      async update(issue, patch) {
        calls.push(['update', patch]);
        if (fail) throw new Error('Save failed');
        rows = removeAfterUpdate
          ? []
          : rows.map((row) => ({ ...row, ...patch }));
        return { id: issue.id, ...patch };
      },
      async getAvailableStates() {
        calls.push(['states']);
        return [{ id: 'next' }];
      },
    },
  );
  return { controller, calls };
}

test('сохранение перечитывает список, сохраняя страницу и сортировку', async () => {
  const { controller, calls } = fixture();
  await controller.load();
  await controller.updateIssue(controller.items.value[0], { priority: 'high' });
  assert.deepEqual(calls, [
    ['load', 2, 'priority'],
    ['update', { priority: 'high' }],
    ['load', 2, 'priority'],
  ]);
  assert.equal(controller.items.value[0].priority, 'high');
  assert.equal(controller.items.value[0].attachment_count, 3);
});

test('после обновления задача может исчезнуть из отфильтрованного списка', async () => {
  const { controller } = fixture({ removeAfterUpdate: true });
  await controller.load();
  await controller.updateIssue(controller.items.value[0], { state: 'done' });
  assert.deepEqual(controller.items.value, []);
  assert.equal(controller.total.value, 0);
});

test('при отсутствии прав обновление и загрузка статусов не вызывают API', async () => {
  const { controller, calls } = fixture({ allowed: false });
  await controller.load();
  await assert.rejects(
    controller.updateIssue(controller.items.value[0], { priority: null }),
  );
  assert.deepEqual(
    await controller.getAvailableStates(controller.items.value[0]),
    [],
  );
  assert.deepEqual(calls, [['load', 2, 'priority']]);
});

test('ошибка сохранения не изменяет строку; статусы загружаются по требованию', async () => {
  const { controller, calls } = fixture({ fail: true });
  await controller.load();
  await assert.rejects(
    controller.updateIssue(controller.items.value[0], { priority: 'high' }),
  );
  assert.equal(controller.items.value[0].priority, 'low');
  assert.equal(
    calls.some(([type]) => type === 'states'),
    false,
  );
  assert.deepEqual(
    await controller.getAvailableStates(controller.items.value[0]),
    [{ id: 'next' }],
  );
});

test('каждое открытие списка статусов запрашивает актуальные переходы без кэша', async () => {
  const { controller, calls } = fixture();
  await controller.load();
  assert.equal(calls.filter(([type]) => type === 'states').length, 0);
  await controller.getAvailableStates(controller.items.value[0]);
  await controller.getAvailableStates(controller.items.value[0]);
  assert.equal(calls.filter(([type]) => type === 'states').length, 2);
  await controller.load();
  assert.equal(calls.filter(([type]) => type === 'states').length, 2);
});
