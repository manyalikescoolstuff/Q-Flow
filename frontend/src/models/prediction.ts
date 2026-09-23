/**
 * Hourly predicted operational forecast point.
 */
export interface HourlyForecastPoint {
  /** Hour of day (e.g. 9 for 09:00) */
  hour: number;
  /** Formatted hour label (e.g. "09:00" or "09:00–10:00") */
  label: string;
  /** Time range label (e.g. "09:00 – 10:00") */
  timeRange: string;
  /** Predicted visitor footfall arrivals in this hour */
  predictedFootfall: number;
  /** Expected average wait time in seconds in this hour */
  predictedAvgWaitSec: number;
}

/**
 * Expected service demand and queue pressure forecast per service.
 */
export interface ServiceDemandForecast {
  serviceId: string;
  serviceName: string;
  /** Expected number of service requests/tokens in the forecast period */
  expectedRequests: number;
  /** Expected average waiting time in seconds */
  expectedAvgWaitSec: number;
  /** Expected average service handling time in seconds */
  expectedServiceSec: number;
  /** Number of physical workstations available/configured for this service */
  availableCounters: number;
  /** Forecast queue load status */
  forecastLoadStatus: 'NORMAL' | 'BUSY' | 'HIGH LOAD';
}

/**
 * Aggregated prediction / forecast data for the service centre.
 *
 * NOTE ON PROTOTYPE FORECASTING:
 * For the V1 frontend prototype, forecasts are generated using transparent,
 * deterministic calculations based on centralized historical operational baselines.
 * No trained ML model is running in V1. Later this structure will be populated
 * by FastAPI prediction endpoints using PostgreSQL historical data.
 */
export interface PredictionSnapshot {
  /** Forecast period label (e.g. "Next Operating Period (09:00 – 17:00)") */
  forecastPeriod: string;
  /** Total predicted visitor footfall for the period */
  predictedFootfallToday: number;
  /** Total expected service requests */
  totalExpectedRequests: number;
  /** Expected peak arrival hour (0-23) */
  expectedPeakHour: number;
  /** Expected overall average waiting time in seconds */
  expectedAvgWaitSec: number;
  /** Hourly forecast breakdown (09:00 – 17:00) */
  hourlyForecast: HourlyForecastPoint[];
  /** Expected demand and pressure per service */
  serviceForecasts: Record<string, ServiceDemandForecast>;
  /** Historical baseline arrays (kept for backwards compatibility) */
  predictedHourlyFootfall?: number[];
  predictedAvgWaitSec?: number[];
  predictedQueueLoad?: Record<string, number>;
}

