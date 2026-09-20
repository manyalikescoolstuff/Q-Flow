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
}
