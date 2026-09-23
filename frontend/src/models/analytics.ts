/**
 * Hourly aggregated operational metric for operational hours.
 */
export interface HourlyOperationalMetric {
  /** Hour of day (e.g. 9 for 09:00) */
  hour: number;
  /** Formatted hour label (e.g. "09:00" or "09:00–10:00") */
  label: string;
  /** Total visitor footfall in this hour */
  footfall: number;
  /** Average waiting time in seconds in this hour */
  avgWaitSec: number;
}

/**
 * Historical service performance and volume metrics.
 */
export interface ServicePerformanceRecord {
  serviceId: string;
  serviceName: string;
  customersServed: number;
  avgWaitTimeSec: number;
  avgServiceTimeSec: number;
  missedTokens: number;
}

/**
 * Aggregated analytics / KPI data for the service centre.
 * Represents historical / current-day operational metrics.
 */
export interface AnalyticsSnapshot {
  /** Total footfall today */
  totalFootfallToday: number;
  /** Total customers served today across all counters */
  totalServedToday: number;
  /** Average waiting time in seconds (across all served tokens today) */
  avgWaitTimeSec: number;
  /** Average service time in seconds (across all served tokens today) */
  avgServiceTimeSec: number;
  /** Peak hour of the day (0-23) based on historical data */
  peakHour: number;
  /** Hourly footfall breakdown: index = hour (0-23), value = count */
  hourlyFootfall: number[];
  /** Hourly average wait time in seconds: index = hour */
  hourlyAvgWaitSec: number[];
  /** Operating hours breakdown (09:00 – 17:00) */
  operatingHours: HourlyOperationalMetric[];
  /** Historical per-service performance breakdown */
  servicePerformance: Record<string, ServicePerformanceRecord>;
}

