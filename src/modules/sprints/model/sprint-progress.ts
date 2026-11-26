import type { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getSprintProgress(stats?: TypesSprintStats) {
  const total = stats?.all_issues ?? 0;
  const done = (stats?.completed ?? 0) + (stats?.cancelled ?? 0);
  const percent = total ? Math.round((done / total) * 100) : 0;
  return { total, done, percent };
}
