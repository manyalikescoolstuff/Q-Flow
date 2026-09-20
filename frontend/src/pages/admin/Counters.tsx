import { useState, useEffect } from 'react';
import { useAdminCounters } from '@/hooks/useQFlow';
import { formatTimer } from '@/utils/format';
import './Counters.css';

/**
 * Admin Counters page (/admin/counters).
 *
 * Operational control-room monitoring page answering:
 * "What is happening at each physical service counter right now?"
 *
 * 1. Top summary metrics (Total, Active, Paused, Average Utilization)
 * 2. Real-time counter monitoring table with live elapsed durations,
 *    token assignments, served counts, and utilization progress bars.
 *
 * All values derive dynamically from shared Zustand store state.
 * Read-only monitoring — operational controls belong strictly to Staff.
 */
export function CountersPage() {
  const { summary, counters } = useAdminCounters();

  // Live second-by-second ticker for active service durations
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-counters">
      {/* ------------------------------------------------------------ */}
      {/*  PAGE HEADER                                                 */}
      {/* ------------------------------------------------------------ */}
      <header className="admin-counters__header">
        <div className="admin-counters__title-group">
          <h1 className="admin-counters__title">Counters</h1>
          <span className="admin-counters__subtitle">
            Physical Service Counter Operations &amp; Live Telemetry
          </span>
        </div>

        <div className="admin-counters__live-pill">
          <span className="admin-counters__live-dot" />
          <span>LIVE</span>
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  1. TOP SUMMARY METRICS                                      */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-counters__summary" aria-label="Counters Summary">
        {/* Total Counters */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Total Counters</span>
          <span className="admin-metric-card__value">{summary.totalCounters}</span>
          <span className="admin-metric-card__subtext">
            Physical workstations configured
          </span>
        </div>

        {/* Active Counters */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Active Counters</span>
          <span className="admin-metric-card__value">
            {summary.activeCounters} / {summary.totalCounters}
          </span>
          <span className="admin-metric-card__subtext">
            Currently serving or ready
          </span>
        </div>

        {/* Paused Counters */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Paused Counters</span>
          <span className="admin-metric-card__value">{summary.pausedCounters}</span>
          <span className="admin-metric-card__subtext">
            {summary.pausedCounters > 0
              ? 'Temporarily inactive / break'
              : 'Zero counters paused'}
          </span>
        </div>

        {/* Average Counter Utilization */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Avg. Utilization</span>
          <span className="admin-metric-card__value">{summary.avgUtilization}%</span>
          <span className="admin-metric-card__subtext">
            Active counters operational load
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  2. COUNTER MONITORING TABLE                                 */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-counters__section" aria-label="Counter Monitoring">
        <div className="admin-counters__section-header">
          <div className="admin-counters__section-title-wrap">
            <h2 className="admin-counters__section-title">
              Physical Service Counters
            </h2>
            <span className="admin-counters__section-count">
              {counters.length} Counters
            </span>
          </div>
        </div>

        <div className="admin-counters__table-wrapper">
          <table className="admin-counters__table">
            <thead>
              <tr>
                <th>Counter</th>
                <th>Assigned Service</th>
                <th>Status</th>
                <th>Current Token</th>
                <th>Duration</th>
                <th>Served Today</th>
                <th>Avg. Service Time</th>
                <th>Utilization</th>
              </tr>
            </thead>
            <tbody>
              {counters.map((item) => {
                const isPaused = item.isPaused;
                const hasServingToken = !isPaused && item.currentTokenId && item.calledAt;

                // Compute live elapsed service duration
                let elapsedSec = 0;
                let durationFormatted = '—';
                let isLongDuration = false;

                if (hasServingToken && item.calledAt) {
                  elapsedSec = Math.max(
                    0,
                    Math.floor((now - new Date(item.calledAt).getTime()) / 1000),
                  );
                  durationFormatted = formatTimer(elapsedSec);

                  // Flag if duration exceeds 1.5x expected service duration (simple deterministic threshold)
                  if (elapsedSec > item.expectedDurationSec * 1.5) {
                    isLongDuration = true;
                  }
                }

                return (
                  <tr
                    key={item.id}
                    className={isPaused ? 'admin-counters__tr--paused' : undefined}
                  >
                    {/* Counter Number & Staff */}
                    <td>
                      <div className="admin-counters__label">{item.label}</div>
                      <div className="admin-counters__staff-sub">
                        {item.staffName}
                      </div>
                    </td>

                    {/* Assigned Service */}
                    <td className="admin-counters__service">
                      {item.serviceName}
                    </td>

                    {/* Status: ACTIVE / PAUSED + Attention Flag */}
                    <td>
                      <div className="admin-counters__status-cell">
                        {isPaused ? (
                          <span className="counter-pill counter-pill--paused">
                            ⏸ PAUSED
                          </span>
                        ) : (
                          <span className="counter-pill counter-pill--active">
                            <span className="counter-pill__dot" /> ACTIVE
                          </span>
                        )}

                        {isLongDuration && (
                          <span
                            className="admin-counters__attention-badge"
                            title={`Serving duration exceeds expected ${formatTimer(item.expectedDurationSec)} benchmark`}
                          >
                            LONG SERVICE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Current Token */}
                    <td>
                      {item.currentTokenDisplay !== '—' ? (
                        <span className="admin-table__token-tag">
                          {item.currentTokenDisplay}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Current Service Duration */}
                    <td>
                      <span
                        className={`admin-counters__duration${isLongDuration ? ' admin-counters__duration--long' : ''}`}
                      >
                        {durationFormatted}
                      </span>
                    </td>

                    {/* Customers Served Today */}
                    <td className="admin-counters__mono">
                      {item.servedToday} Served
                    </td>

                    {/* Average Service Time */}
                    <td className="admin-counters__mono">
                      Avg {item.avgServiceTimeFormatted}
                    </td>

                    {/* Counter Utilization */}
                    <td>
                      <div className="admin-counters__util-cell">
                        <span className="admin-counters__util-pct">
                          {item.utilizationRate}%
                        </span>
                        <div className="admin-counters__util-bar">
                          <div
                            className={`admin-counters__util-fill${item.utilizationRate >= 85 ? ' admin-counters__util-fill--high' : ''}${isPaused ? ' admin-counters__util-fill--paused' : ''}`}
                            style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
