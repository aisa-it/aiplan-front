import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import type { DtoProjectStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import type { MessageKey } from '@/i18n';
import type issuesMessages from '../i18n/ru';

type SectionKey = keyof typeof issuesMessages.analytics.sections;
type MetricKey = keyof typeof issuesMessages.analytics.metrics;

interface AnalyticsMetric {
  label: string;
  count: number;
}

interface AnalyticsCard {
  id: string;
  title?: string;
  metrics: AnalyticsMetric[];
}

interface AnalyticsSection {
  id: SectionKey;
  cards: AnalyticsCard[];
}

const formatMonth = (month: string | undefined, locale: string) => {
  if (!month) return undefined;

  const date = dayjs(month);
  if (!date.isValid()) return undefined;

  const label = date.locale(locale).format('MMMM YYYY');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const singleMetricCard = (
  id: string,
  label: string,
  count: number | undefined,
): AnalyticsCard => ({
  id,
  metrics: [{ label, count: count ?? 0 }],
});

export const buildProjectAnalytics = (
  stats: DtoProjectStats,
  t: (key: MessageKey) => string,
  locale: string,
): AnalyticsSection[] => {
  const metricLabel = (key: MetricKey) => t(`issues.analytics.metrics.${key}`);
  const counter = (key: MetricKey, count: number | undefined) =>
    singleMetricCard(key, metricLabel(key), count);
  const metric = (key: MetricKey, count: number | undefined): AnalyticsMetric => ({
    label: metricLabel(key),
    count: count ?? 0,
  });

  const completedByMonth = new Map(
    (stats.timeline?.completed_by_month ?? []).map(({ month, count }) => [
      month,
      count,
    ]),
  );

  const sections: AnalyticsSection[] = [
    {
      id: 'totals',
      cards: [
        counter('total', stats.issues?.total),
        counter('active', stats.issues?.active),
        counter('completed', stats.issues?.completed),
        counter('cancelled', stats.issues?.cancelled),
      ],
    },
    {
      id: 'byStatus',
      cards: (stats.by_state ?? []).map(({ state_id, name, count }, index) =>
        singleMetricCard(state_id ?? String(index), name ?? '', count),
      ),
    },
    {
      id: 'byPriority',
      cards: [
        counter('low', stats.by_priority?.low),
        counter('medium', stats.by_priority?.medium),
        counter('high', stats.by_priority?.high),
        counter('urgent', stats.by_priority?.urgent),
        counter('noPriority', stats.by_priority?.none),
      ],
    },
    {
      id: 'byStatusGroup',
      cards: [
        counter('created', stats.by_state_group?.backlog),
        counter('unstarted', stats.by_state_group?.unstarted),
        counter('started', stats.by_state_group?.started),
        counter('resolved', stats.by_state_group?.completed),
        counter('canceledState', stats.by_state_group?.cancelled),
      ],
    },
    {
      id: 'overdue',
      cards: [counter('overdue', stats.overdue?.count)],
    },
    {
      id: 'byAssignee',
      cards: (stats.assignee_stats ?? []).map(
        ({ user_id, display_name, active, completed }, index) => ({
          id: user_id ?? String(index),
          title: display_name,
          metrics: [metric('active', active), metric('completed', completed)],
        }),
      ),
    },
    {
      id: 'byTag',
      cards: (stats.label_stats ?? []).map(({ label_id, name, count }, index) =>
        singleMetricCard(label_id ?? String(index), name ?? '', count),
      ),
    },
    {
      id: 'bySprint',
      cards: (stats.sprint_stats ?? []).map(
        ({ sprint_id, name, total, completed }, index) => ({
          id: sprint_id ?? String(index),
          title: name,
          metrics: [metric('created', total), metric('resolved', completed)],
        }),
      ),
    },
    {
      id: 'timeline',
      cards: [...(stats.timeline?.created_by_month ?? [])]
        .reverse()
        .map(({ month, count }, index) => ({
          id: month ?? String(index),
          title: formatMonth(month, locale),
          metrics: [
            metric('created', count),
            metric('resolved', completedByMonth.get(month)),
          ],
        })),
    },
  ];

  return sections.filter(({ cards }) => cards.length > 0);
};
