/**
 * Custom hooks for accessing Q-FLOW store data with computed selectors.
 *
 * These hooks encapsulate common read patterns so components
 * don't need to know about the store's internal shape.
 * When the backend replaces the mock store, only these hooks
 * (or the store itself) need to change – not the components.
 */

import { useQFlowStore } from '@/mock/store';
import type { Counter, Token, Queue, Service } from '@/models';
import { formatDuration, formatTimer } from '@/utils/format';

/**
 * Get all data a staff member needs for their counter view.
 */
export function useStaffCounter(staffId: string) {
  const staff = useQFlowStore((s) => s.staff[staffId]);
  const counterId = staff?.counterId;
  const counter = useQFlowStore((s) =>
    counterId ? s.counters[counterId] : undefined,
  );
  const service = useQFlowStore((s) =>
    counter ? s.services[counter.serviceId] : undefined,
  );
  const currentToken = useQFlowStore((s) =>
    counter?.currentTokenId ? s.tokens[counter.currentTokenId] : undefined,
  );
  const queue = useQFlowStore((s) =>
    counter ? s.queues[counter.queueId] : undefined,
  );
  const tokens = useQFlowStore((s) => s.tokens);

  // Compute the upcoming token preview (first 3 waiting)
  const upcomingTokens: Token[] = queue
    ? queue.waitingTokenIds.slice(0, 3).map((id) => tokens[id]).filter(Boolean)
    : [];

  const waitingCount = queue ? queue.waitingTokenIds.length : 0;
  const nextToken = upcomingTokens[0] ?? null;

  // Estimated wait for the last person in line
  const estimatedWaitSec = counter
    ? waitingCount * counter.avgServiceTimeSec
    : 0;

  return {
    staff,
    counter,
    service,
    currentToken,
    queue,
    nextToken,
    upcomingTokens,
    waitingCount,
    estimatedWaitSec,
  };
}

/**
 * Get all counters with their related data (for Admin views).
 */
export function useAllCounters(): Array<{
  counter: Counter;
  service: Service;
  queue: Queue;
  currentToken: Token | undefined;
  waitingCount: number;
}> {
  const counters = useQFlowStore((s) => s.counters);
  const services = useQFlowStore((s) => s.services);
  const queues = useQFlowStore((s) => s.queues);
  const tokens = useQFlowStore((s) => s.tokens);

  return Object.values(counters).map((counter) => ({
    counter,
    service: services[counter.serviceId],
    queue: queues[counter.queueId],
    currentToken: counter.currentTokenId
      ? tokens[counter.currentTokenId]
      : undefined,
    waitingCount: queues[counter.queueId]?.waitingTokenIds.length ?? 0,
  }));
}

/**
 * Get all queues with their related service and tokens (for Admin views).
 */
export function useAllQueues(): Array<{
  queue: Queue;
  service: Service;
  waitingTokens: Token[];
  waitingCount: number;
}> {
  const queues = useQFlowStore((s) => s.queues);
  const services = useQFlowStore((s) => s.services);
  const tokens = useQFlowStore((s) => s.tokens);

  return Object.values(queues).map((queue) => ({
    queue,
    service: services[queue.serviceId],
    waitingTokens: queue.waitingTokenIds.map((id) => tokens[id]).filter(Boolean),
    waitingCount: queue.waitingTokenIds.length,
  }));
}

export interface AdminOverviewQueueItem {
  serviceId: string;
  serviceName: string;
  waitingCount: number;
  servingTokens: string[];
  estWaitSec: number;
  estWaitFormatted: string;
  activeCountersCount: number;
  totalCountersCount: number;
  status: {
    label: 'NORMAL' | 'BUSY' | 'HIGH LOAD';
    tone: 'success' | 'warning' | 'danger';
  };
}

export interface AdminOverviewCounterItem {
  counter: Counter;
  serviceName: string;
  staffName: string;
  currentToken: Token | undefined;
  isPaused: boolean;
}

export interface AdminOverviewData {
  metrics: {
    footfallToday: number;
    waitingNow: number;
    activeCounters: number;
    totalCounters: number;
    avgWaitFormatted: string;
  };
  liveQueues: AdminOverviewQueueItem[];
  counterStatuses: AdminOverviewCounterItem[];
}

/**
 * Get aggregated real-time operational data for the Admin Overview.
 * All values derive dynamically from shared Zustand store state.
 */
export function useAdminOverview(): AdminOverviewData {
  const services = useQFlowStore((s) => s.services);
  const queues = useQFlowStore((s) => s.queues);
  const counters = useQFlowStore((s) => s.counters);
  const tokens = useQFlowStore((s) => s.tokens);
  const staff = useQFlowStore((s) => s.staff);
  const analytics = useQFlowStore((s) => s.analytics);

  const counterList = Object.values(counters);
  const serviceList = Object.values(services);
  const queueList = Object.values(queues);

  // 1. Top Summary Metrics
  const totalServedToday = counterList.reduce((sum, c) => sum + c.servedToday, 0);
  const servedDelta = Math.max(0, totalServedToday - 15);
  const footfallToday = analytics.totalFootfallToday + servedDelta;

  const waitingNow = queueList.reduce(
    (sum, q) => sum + q.waitingTokenIds.length,
    0,
  );

  const totalCounters = counterList.length;
  const activeCounters = counterList.filter((c) => c.status === 'ACTIVE').length;

  // 2. Live Queues
  const liveQueues: AdminOverviewQueueItem[] = serviceList.map((service) => {
    const queue = queueList.find((q) => q.serviceId === service.id);
    const waitingCount = queue?.waitingTokenIds.length ?? 0;

    const assignedCounters = counterList.filter(
      (c) => c.serviceId === service.id,
    );
    const activeCountersCount = assignedCounters.filter(
      (c) => c.status === 'ACTIVE',
    ).length;
    const totalCountersCount = assignedCounters.length;

    const servingTokens: string[] = [];
    assignedCounters.forEach((c) => {
      if (c.currentTokenId && tokens[c.currentTokenId]) {
        servingTokens.push(tokens[c.currentTokenId].displayNumber);
      }
    });

    let estWaitSec = 0;
    let estWaitFormatted = '—';
    if (waitingCount === 0) {
      estWaitSec = 0;
      estWaitFormatted = '0 min';
    } else if (activeCountersCount > 0) {
      estWaitSec = Math.round(
        (waitingCount * service.expectedDurationSec) / activeCountersCount,
      );
      estWaitFormatted = `${Math.max(1, Math.round(estWaitSec / 60))} min`;
    } else {
      estWaitSec = waitingCount * service.expectedDurationSec;
      estWaitFormatted = '— (Paused)';
    }

    let statusLabel: 'NORMAL' | 'BUSY' | 'HIGH LOAD' = 'NORMAL';
    let statusTone: 'success' | 'warning' | 'danger' = 'success';

    if (activeCountersCount === 0 && waitingCount > 0) {
      statusLabel = 'HIGH LOAD';
      statusTone = 'danger';
    } else if (waitingCount === 0) {
      statusLabel = 'NORMAL';
      statusTone = 'success';
    } else {
      const loadRatio = waitingCount / Math.max(1, activeCountersCount);
      if (loadRatio >= 5 || estWaitSec >= 1080) {
        statusLabel = 'HIGH LOAD';
        statusTone = 'danger';
      } else if (loadRatio >= 2.5 || estWaitSec >= 600) {
        statusLabel = 'BUSY';
        statusTone = 'warning';
      } else {
        statusLabel = 'NORMAL';
        statusTone = 'success';
      }
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      waitingCount,
      servingTokens,
      estWaitSec,
      estWaitFormatted,
      activeCountersCount,
      totalCountersCount,
      status: {
        label: statusLabel,
        tone: statusTone,
      },
    };
  });

  const queuesWithWait = liveQueues.filter((q) => q.waitingCount > 0);
  let avgWaitFormatted = '0 min';
  if (queuesWithWait.length > 0) {
    const totalEstWait = queuesWithWait.reduce((sum, q) => sum + q.estWaitSec, 0);
    const avgWaitSec = Math.round(totalEstWait / queuesWithWait.length);
    avgWaitFormatted = `${Math.max(1, Math.round(avgWaitSec / 60))} min`;
  }

  // 3. Counter Status Cards
  const counterStatuses: AdminOverviewCounterItem[] = counterList.map(
    (counter) => {
      const service = services[counter.serviceId];
      const staffMember = counter.staffId ? staff[counter.staffId] : undefined;
      const currentToken = counter.currentTokenId
        ? tokens[counter.currentTokenId]
        : undefined;

      return {
        counter,
        serviceName: service?.name ?? 'Unassigned',
        staffName: staffMember?.name ?? 'Unassigned',
        currentToken,
        isPaused: counter.status === 'PAUSED',
      };
    },
  );

  return {
    metrics: {
      footfallToday,
      waitingNow,
      activeCounters,
      totalCounters,
      avgWaitFormatted,
    },
    liveQueues,
    counterStatuses,
  };
}

export type QueueTrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING';

export interface AdminQueueTrend {
  direction: QueueTrendDirection;
  label: string;
  symbol: string;
}

export interface AdminQueuesSummary {
  totalWaiting: number;
  activeQueuesCount: number;
  totalQueuesCount: number;
  busiestQueueName: string;
  busiestQueueWaiting: number;
  highestWaitFormatted: string;
  highestWaitServiceName: string;
}

export interface AdminQueueRowItem {
  serviceId: string;
  serviceName: string;
  queueId: string;
  waitingCount: number;
  servingTokens: string[];
  estWaitSec: number;
  estWaitFormatted: string;
  avgServiceTimeSec: number;
  avgServiceTimeFormatted: string;
  activeCountersCount: number;
  totalCountersCount: number;
  missedCount: number;
  status: {
    label: 'NORMAL' | 'BUSY' | 'HIGH LOAD';
    tone: 'success' | 'warning' | 'danger';
  };
  trend: AdminQueueTrend;
  waitingTokens: Token[];
  next3Tokens: Token[];
}

export interface AdminQueuesData {
  summary: AdminQueuesSummary;
  queues: AdminQueueRowItem[];
}

function calculateQueueTrend(
  currentCount: number,
  recentHistory?: number[],
): AdminQueueTrend {
  if (!recentHistory || recentHistory.length === 0) {
    return { direction: 'STABLE', label: 'Stable', symbol: '→' };
  }
  const prevCount = recentHistory[recentHistory.length - 1];
  if (currentCount > prevCount) {
    return { direction: 'INCREASING', label: 'Increasing', symbol: '↗' };
  }
  if (currentCount < prevCount) {
    return { direction: 'DECREASING', label: 'Decreasing', symbol: '↘' };
  }
  return { direction: 'STABLE', label: 'Stable', symbol: '→' };
}

/**
 * Get detailed real-time operational data for all service queues.
 * Subscribes directly to the shared Zustand store.
 */
export function useAdminQueues(): AdminQueuesData {
  const services = useQFlowStore((s) => s.services);
  const queues = useQFlowStore((s) => s.queues);
  const counters = useQFlowStore((s) => s.counters);
  const tokens = useQFlowStore((s) => s.tokens);

  const counterList = Object.values(counters);
  const serviceList = Object.values(services);
  const queueList = Object.values(queues);

  const queueRows: AdminQueueRowItem[] = serviceList.map((service) => {
    const queue = queueList.find((q) => q.serviceId === service.id);
    const waitingCount = queue ? queue.waitingTokenIds.length : 0;

    const assignedCounters = counterList.filter(
      (c) => c.serviceId === service.id,
    );
    const activeCountersCount = assignedCounters.filter(
      (c) => c.status === 'ACTIVE',
    ).length;
    const totalCountersCount = assignedCounters.length;

    const servingTokens: string[] = [];
    assignedCounters.forEach((c) => {
      if (c.currentTokenId && tokens[c.currentTokenId]) {
        servingTokens.push(tokens[c.currentTokenId].displayNumber);
      }
    });

    const avgServiceTimeSec = service.expectedDurationSec;
    const avgServiceTimeFormatted = formatDuration(avgServiceTimeSec);

    const missedCount = Object.values(tokens).filter(
      (t) => t.queueId === queue?.id && t.status === 'MISSED',
    ).length;

    let estWaitSec = 0;
    let estWaitFormatted = '—';
    if (waitingCount === 0) {
      estWaitSec = 0;
      estWaitFormatted = '0 min';
    } else if (activeCountersCount > 0) {
      estWaitSec = Math.round(
        (waitingCount * avgServiceTimeSec) / activeCountersCount,
      );
      estWaitFormatted = `${Math.max(1, Math.round(estWaitSec / 60))} min`;
    } else {
      estWaitSec = waitingCount * avgServiceTimeSec;
      estWaitFormatted = '— (Paused)';
    }

    let statusLabel: 'NORMAL' | 'BUSY' | 'HIGH LOAD' = 'NORMAL';
    let statusTone: 'success' | 'warning' | 'danger' = 'success';

    if (activeCountersCount === 0 && waitingCount > 0) {
      statusLabel = 'HIGH LOAD';
      statusTone = 'danger';
    } else if (waitingCount === 0) {
      statusLabel = 'NORMAL';
      statusTone = 'success';
    } else {
      const loadRatio = waitingCount / Math.max(1, activeCountersCount);
      if (loadRatio >= 5 || estWaitSec >= 1080) {
        statusLabel = 'HIGH LOAD';
        statusTone = 'danger';
      } else if (loadRatio >= 2.5 || estWaitSec >= 600) {
        statusLabel = 'BUSY';
        statusTone = 'warning';
      } else {
        statusLabel = 'NORMAL';
        statusTone = 'success';
      }
    }

    const trend = calculateQueueTrend(waitingCount, queue?.recentHistory);

    const waitingTokens: Token[] = queue
      ? queue.waitingTokenIds.map((id) => tokens[id]).filter(Boolean)
      : [];
    const next3Tokens = waitingTokens.slice(0, 3);

    return {
      serviceId: service.id,
      serviceName: service.name,
      queueId: queue?.id ?? '',
      waitingCount,
      servingTokens,
      estWaitSec,
      estWaitFormatted,
      avgServiceTimeSec,
      avgServiceTimeFormatted,
      activeCountersCount,
      totalCountersCount,
      missedCount,
      status: {
        label: statusLabel,
        tone: statusTone,
      },
      trend,
      waitingTokens,
      next3Tokens,
    };
  });

  // Top summary metrics
  const totalWaiting = queueList.reduce(
    (sum, q) => sum + q.waitingTokenIds.length,
    0,
  );

  const activeQueuesCount = queueRows.filter(
    (q) => q.activeCountersCount > 0 || q.waitingCount > 0,
  ).length;

  // Busiest queue: highest waiting count (or est wait as tie-breaker)
  let busiestQueueName = 'None';
  let busiestQueueWaiting = 0;
  const queuesWithWaiting = queueRows.filter((q) => q.waitingCount > 0);
  if (queuesWithWaiting.length > 0) {
    const sortedByWaiting = [...queuesWithWaiting].sort(
      (a, b) => b.waitingCount - a.waitingCount || b.estWaitSec - a.estWaitSec,
    );
    busiestQueueName = sortedByWaiting[0].serviceName;
    busiestQueueWaiting = sortedByWaiting[0].waitingCount;
  }

  // Highest current wait
  let highestWaitFormatted = '0 min';
  let highestWaitServiceName = 'No delay';
  if (queuesWithWaiting.length > 0) {
    const sortedByWait = [...queuesWithWaiting].sort(
      (a, b) => b.estWaitSec - a.estWaitSec,
    );
    highestWaitFormatted = sortedByWait[0].estWaitFormatted;
    highestWaitServiceName = sortedByWait[0].serviceName;
  }

  return {
    summary: {
      totalWaiting,
      activeQueuesCount,
      totalQueuesCount: serviceList.length,
      busiestQueueName,
      busiestQueueWaiting,
      highestWaitFormatted,
      highestWaitServiceName,
    },
    queues: queueRows,
  };
}

export interface AdminCountersSummary {
  totalCounters: number;
  activeCounters: number;
  pausedCounters: number;
  avgUtilization: number;
}

export interface AdminCounterItem {
  id: string;
  label: string;
  serviceId: string;
  serviceName: string;
  status: 'ACTIVE' | 'PAUSED';
  staffName: string;
  currentTokenDisplay: string;
  currentTokenId: string | null;
  calledAt?: string;
  servingStartedAt?: number | null;
  expectedDurationSec: number;
  servedToday: number;
  avgServiceTimeSec: number;
  avgServiceTimeFormatted: string;
  utilizationRate: number;
  isPaused: boolean;
}

export interface AdminCountersData {
  summary: AdminCountersSummary;
  counters: AdminCounterItem[];
}

/**
 * Get detailed real-time operational data for all physical service counters.
 * Subscribes directly to the shared Zustand store.
 */
export function useAdminCounters(): AdminCountersData {
  const services = useQFlowStore((s) => s.services);
  const counters = useQFlowStore((s) => s.counters);
  const tokens = useQFlowStore((s) => s.tokens);
  const staff = useQFlowStore((s) => s.staff);

  const counterList = Object.values(counters);

  const counterItems: AdminCounterItem[] = counterList.map((counter) => {
    const service = services[counter.serviceId];
    const staffMember = counter.staffId ? staff[counter.staffId] : undefined;
    const currentToken = counter.currentTokenId
      ? tokens[counter.currentTokenId]
      : undefined;

    const currentTokenDisplay = currentToken ? currentToken.displayNumber : '—';
    const calledAt = currentToken ? currentToken.calledAt : undefined;

    const expectedDurationSec = service?.expectedDurationSec ?? 300;
    const avgServiceTimeSec =
      counter.avgServiceTimeSec > 0
        ? counter.avgServiceTimeSec
        : expectedDurationSec;
    const avgServiceTimeFormatted = formatTimer(avgServiceTimeSec);

    const utilizationRate =
      counter.status === 'ACTIVE' ? (counter.utilizationRate ?? 75) : 0;

    return {
      id: counter.id,
      label: counter.label,
      serviceId: counter.serviceId,
      serviceName: service?.name ?? 'Unassigned',
      status: counter.status,
      staffName: staffMember?.name ?? 'Unassigned',
      currentTokenDisplay,
      currentTokenId: counter.currentTokenId,
      calledAt,
      servingStartedAt: counter.servingStartedAt ?? null,
      expectedDurationSec,
      servedToday: counter.servedToday,
      avgServiceTimeSec,
      avgServiceTimeFormatted,
      utilizationRate,
      isPaused: counter.status === 'PAUSED',
    };
  });

  const totalCounters = counterList.length;
  const activeCounters = counterList.filter((c) => c.status === 'ACTIVE').length;
  const pausedCounters = totalCounters - activeCounters;

  const activeCountersList = counterItems.filter((c) => c.status === 'ACTIVE');
  const avgUtilization =
    activeCountersList.length > 0
      ? Math.round(
          activeCountersList.reduce((sum, c) => sum + c.utilizationRate, 0) /
            activeCountersList.length,
        )
      : 0;

  return {
    summary: {
      totalCounters,
      activeCounters,
      pausedCounters,
      avgUtilization,
    },
    counters: counterItems,
  };
}

/* ------------------------------------------------------------------ */
/*  Admin Analytics Types & Hook                                      */
/* ------------------------------------------------------------------ */

export interface AdminAnalyticsHourlyItem {
  hour: number;
  label: string;
  timeRange: string;
  footfall: number;
  avgWaitSec: number;
  avgWaitFormatted: string;
  isPeak: boolean;
}

export interface AdminAnalyticsServiceDemandItem {
  serviceId: string;
  serviceName: string;
  customerVolume: number;
  percentage: number;
  isHighest: boolean;
}

export interface AdminAnalyticsCounterUtilItem {
  counterId: string;
  counterLabel: string;
  serviceName: string;
  staffName: string;
  utilizationRate: number;
  status: 'ACTIVE' | 'PAUSED';
  isPaused: boolean;
  isHighest: boolean;
}

export interface AdminAnalyticsServicePerformanceRow {
  serviceId: string;
  serviceName: string;
  customersServed: number;
  avgWaitSec: number;
  avgWaitFormatted: string;
  avgServiceSec: number;
  avgServiceFormatted: string;
  expectedDurationSec: number;
  expectedDurationFormatted: string;
  missedTokens: number;
  status: {
    label: string;
    tone: 'success' | 'warning' | 'danger';
  };
}

export interface AdminAnalyticsInsights {
  peakFootfall: {
    timeWindow: string;
    count: number;
    description: string;
  };
  highestDemandService: {
    serviceName: string;
    volume: number;
    percentage: number;
  };
  highestWaitBottleneck: {
    serviceName: string;
    avgWaitFormatted: string;
    avgWaitSec: number;
  };
  busiestCounter: {
    counterLabel: string;
    serviceName: string;
    utilizationRate: number;
  };
}

export interface AdminAnalyticsData {
  summary: {
    totalVisitorsToday: number;
    avgWaitTimeSec: number;
    avgWaitTimeFormatted: string;
    avgServiceTimeSec: number;
    avgServiceTimeFormatted: string;
    avgCounterUtilization: number;
    activeCountersCount: number;
    totalCountersCount: number;
  };
  hourlyData: AdminAnalyticsHourlyItem[];
  peakHourData: AdminAnalyticsHourlyItem | null;
  serviceDemand: AdminAnalyticsServiceDemandItem[];
  counterUtilization: AdminAnalyticsCounterUtilItem[];
  servicePerformance: AdminAnalyticsServicePerformanceRow[];
  insights: AdminAnalyticsInsights;
}

/**
 * Get centralized historical analytics data for the Admin Analytics page (/admin/analytics).
 * Computes deterministic KPIs, hourly distribution, service demand, counter utilization,
 * service performance matrix, and operational bottleneck insights.
 */
export function useAdminAnalytics(): AdminAnalyticsData {
  const analytics = useQFlowStore((s) => s.analytics);
  const services = useQFlowStore((s) => s.services);
  const counters = useQFlowStore((s) => s.counters);
  const staff = useQFlowStore((s) => s.staff);

  const counterList = Object.values(counters);
  const serviceList = Object.values(services);

  // 1. Counter Utilization & Active Status (exact match with useAdminCounters)
  const activeCountersList = counterList.filter((c) => c.status === 'ACTIVE');
  const activeCountersCount = activeCountersList.length;
  const totalCountersCount = counterList.length;

  const avgCounterUtilization =
    activeCountersList.length > 0
      ? Math.round(
          activeCountersList.reduce(
            (sum, c) => sum + (c.utilizationRate ?? 75),
            0,
          ) / activeCountersList.length,
        )
      : 0;

  // 2. Summary KPIs
  const summary = {
    totalVisitorsToday: analytics.totalFootfallToday,
    avgWaitTimeSec: analytics.avgWaitTimeSec,
    avgWaitTimeFormatted: formatDuration(analytics.avgWaitTimeSec),
    avgServiceTimeSec: analytics.avgServiceTimeSec,
    avgServiceTimeFormatted: formatDuration(analytics.avgServiceTimeSec),
    avgCounterUtilization,
    activeCountersCount,
    totalCountersCount,
  };

  // 3. Hourly Footfall & Waiting Time Data (09:00 - 17:00 operating hours)
  const operatingHours = analytics.operatingHours && analytics.operatingHours.length > 0
    ? analytics.operatingHours
    : [
        { hour: 9, label: '09:00', footfall: 12, avgWaitSec: 300 },
        { hour: 10, label: '10:00', footfall: 18, avgWaitSec: 480 },
        { hour: 11, label: '11:00', footfall: 22, avgWaitSec: 600 },
        { hour: 12, label: '12:00', footfall: 14, avgWaitSec: 540 },
        { hour: 13, label: '13:00', footfall: 8, avgWaitSec: 360 },
        { hour: 14, label: '14:00', footfall: 6, avgWaitSec: 300 },
        { hour: 15, label: '15:00', footfall: 4, avgWaitSec: 240 },
        { hour: 16, label: '16:00', footfall: 3, avgWaitSec: 180 },
      ];

  const maxHourlyFootfall = Math.max(...operatingHours.map((h) => h.footfall), 0);

  const hourlyData: AdminAnalyticsHourlyItem[] = operatingHours.map((item) => {
    const endHour = item.hour + 1;
    const timeRange = `${item.label} – ${String(endHour).padStart(2, '0')}:00`;
    const isPeak = item.footfall === maxHourlyFootfall && maxHourlyFootfall > 0;

    return {
      hour: item.hour,
      label: item.label,
      timeRange,
      footfall: item.footfall,
      avgWaitSec: item.avgWaitSec,
      avgWaitFormatted: formatDuration(item.avgWaitSec),
      isPeak,
    };
  });

  const peakHourData = hourlyData.find((h) => h.isPeak) ?? hourlyData[2] ?? null;

  // 4. Service Demand Breakdown
  const perfMap = analytics.servicePerformance ?? {};
  const totalVolume = serviceList.reduce((sum, s) => {
    const rec = perfMap[s.id];
    return sum + (rec ? rec.customersServed : 0);
  }, 0);

  const rawDemandItems = serviceList.map((service) => {
    const rec = perfMap[service.id];
    const customerVolume = rec ? rec.customersServed : 0;
    const percentage =
      totalVolume > 0
        ? Math.round((customerVolume / totalVolume) * 1000) / 10
        : 0;

    return {
      serviceId: service.id,
      serviceName: service.name,
      customerVolume,
      percentage,
      isHighest: false,
    };
  });

  const maxVolume = Math.max(...rawDemandItems.map((d) => d.customerVolume), 0);
  const serviceDemand: AdminAnalyticsServiceDemandItem[] = rawDemandItems
    .map((item) => ({
      ...item,
      isHighest: item.customerVolume === maxVolume && maxVolume > 0,
    }))
    .sort((a, b) => b.customerVolume - a.customerVolume);

  // 5. Counter Utilization Telemetry
  const counterUtilItems: AdminAnalyticsCounterUtilItem[] = counterList.map(
    (counter) => {
      const service = services[counter.serviceId];
      const staffMember = counter.staffId ? staff[counter.staffId] : undefined;
      const utilizationRate =
        counter.status === 'ACTIVE' ? (counter.utilizationRate ?? 75) : 0;

      return {
        counterId: counter.id,
        counterLabel: counter.label,
        serviceName: service?.name ?? 'Unassigned',
        staffName: staffMember?.name ?? 'Unassigned',
        utilizationRate,
        status: counter.status,
        isPaused: counter.status === 'PAUSED',
        isHighest: false,
      };
    },
  );

  const maxActiveUtil = Math.max(
    ...counterUtilItems
      .filter((c) => !c.isPaused)
      .map((c) => c.utilizationRate),
    0,
  );

  const counterUtilization = counterUtilItems.map((c) => ({
    ...c,
    isHighest: !c.isPaused && c.utilizationRate === maxActiveUtil && maxActiveUtil > 0,
  }));

  // 6. Service Performance Matrix (Table)
  const servicePerformance: AdminAnalyticsServicePerformanceRow[] = serviceList.map(
    (service) => {
      const rec = perfMap[service.id];
      const customersServed = rec ? rec.customersServed : 0;
      const avgWaitSec = rec ? rec.avgWaitTimeSec : 0;
      const avgServiceSec = rec ? rec.avgServiceTimeSec : service.expectedDurationSec;
      const missedTokens = rec ? rec.missedTokens : 0;

      let statusLabel = 'OPTIMAL';
      let statusTone: 'success' | 'warning' | 'danger' = 'success';

      if (avgWaitSec >= 540) {
        statusLabel = 'HIGH WAIT';
        statusTone = 'danger';
      } else if (avgWaitSec >= 400) {
        statusLabel = 'MODERATE';
        statusTone = 'warning';
      } else {
        statusLabel = 'OPTIMAL';
        statusTone = 'success';
      }

      return {
        serviceId: service.id,
        serviceName: service.name,
        customersServed,
        avgWaitSec,
        avgWaitFormatted: formatDuration(avgWaitSec),
        avgServiceSec,
        avgServiceFormatted: formatDuration(avgServiceSec),
        expectedDurationSec: service.expectedDurationSec,
        expectedDurationFormatted: formatDuration(service.expectedDurationSec),
        missedTokens,
        status: {
          label: statusLabel,
          tone: statusTone,
        },
      };
    },
  );

  // 7. Deterministic Insights (Calculated strictly from dataset)
  const highestDemandItem = serviceDemand[0];

  const highestWaitRow = [...servicePerformance].sort(
    (a, b) => b.avgWaitSec - a.avgWaitSec,
  )[0];

  const busiestCounterItem = [...counterUtilization]
    .filter((c) => !c.isPaused)
    .sort((a, b) => b.utilizationRate - a.utilizationRate)[0];

  const peakHourFootfallPct =
    peakHourData && summary.totalVisitorsToday > 0
      ? Math.round((peakHourData.footfall / summary.totalVisitorsToday) * 1000) / 10
      : 0;

  const insights: AdminAnalyticsInsights = {
    peakFootfall: {
      timeWindow: peakHourData ? peakHourData.timeRange : '11:00 – 12:00',
      count: peakHourData ? peakHourData.footfall : 22,
      description: `${peakHourData?.footfall ?? 22} visitors registered (${peakHourFootfallPct}% of daily total)`,
    },
    highestDemandService: {
      serviceName: highestDemandItem ? highestDemandItem.serviceName : 'Aadhaar Update',
      volume: highestDemandItem ? highestDemandItem.customerVolume : 32,
      percentage: highestDemandItem ? highestDemandItem.percentage : 36.8,
    },
    highestWaitBottleneck: {
      serviceName: highestWaitRow ? highestWaitRow.serviceName : 'Land Records',
      avgWaitFormatted: highestWaitRow ? highestWaitRow.avgWaitFormatted : '9m 40s',
      avgWaitSec: highestWaitRow ? highestWaitRow.avgWaitSec : 580,
    },
    busiestCounter: {
      counterLabel: busiestCounterItem ? busiestCounterItem.counterLabel : 'Counter 05',
      serviceName: busiestCounterItem ? busiestCounterItem.serviceName : 'Land Records',
      utilizationRate: busiestCounterItem ? busiestCounterItem.utilizationRate : 92,
    },
  };

  return {
    summary,
    hourlyData,
    peakHourData,
    serviceDemand,
    counterUtilization,
    servicePerformance,
    insights,
  };
}

