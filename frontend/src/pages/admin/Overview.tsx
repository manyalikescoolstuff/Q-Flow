import { useAdminOverview } from '@/hooks/useQFlow';
import './Overview.css';

/**
 * Admin Overview page (/admin).
 *
 * Operational monitoring dashboard answering:
 * "What is happening across the service centre right now?"
 *
 * 1. Top operational summary (Footfall Today, Waiting Now, Active Counters, Avg Wait)
 * 2. Live queues status table (Waiting, Now Serving, Est. Wait, Counters, Operational Status)
 * 3. Counter status monitoring grid (Counter number, Assigned service, ACTIVE/PAUSED, Now Serving)
 *
 * All values derive dynamically from shared Zustand store state.
 * Read-only monitoring — no operational counter controls.
 */
export function OverviewPage() {
  const { metrics, liveQueues, counterStatuses } = useAdminOverview();

  const pausedCountersCount = metrics.totalCounters - metrics.activeCounters;

  return (
    <div className="admin-overview">
      {/* ------------------------------------------------------------ */}
      {/*  PAGE HEADER                                                 */}
      {/* ------------------------------------------------------------ */}
      <header className="admin-overview__header">
        <div className="admin-overview__title-group">
          <h1 className="admin-overview__title">Overview</h1>
          <span className="admin-overview__subtitle">
            Service Centre Real-Time Monitoring
          </span>
        </div>

        <div className="admin-overview__live-pill">
          <span className="admin-overview__live-dot" />
          <span>LIVE</span>
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  1. TOP SUMMARY METRICS                                      */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-overview__metrics" aria-label="Operational Summary">
        {/* Footfall Today */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Footfall Today</span>
          <span className="admin-metric-card__value">{metrics.footfallToday}</span>
          <span className="admin-metric-card__subtext">Total visitors registered today</span>
        </div>

        {/* Waiting Now */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Waiting Now</span>
          <span className="admin-metric-card__value">{metrics.waitingNow}</span>
          <span className="admin-metric-card__subtext">Across all service queues</span>
        </div>

        {/* Active Counters */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Active Counters</span>
          <span className="admin-metric-card__value">
            {metrics.activeCounters} / {metrics.totalCounters}
          </span>
          <span className="admin-metric-card__subtext">
            {pausedCountersCount > 0
              ? `${pausedCountersCount} paused counter${pausedCountersCount > 1 ? 's' : ''}`
              : 'All counters active'}
          </span>
        </div>

        {/* Average Wait */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Avg. Wait</span>
          <span className="admin-metric-card__value">{metrics.avgWaitFormatted}</span>
          <span className="admin-metric-card__subtext">Current queue average</span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  2. LIVE QUEUES                                              */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-overview__section" aria-label="Live Queues">
        <div className="admin-overview__section-header">
          <div className="admin-overview__section-title-wrap">
            <h2 className="admin-overview__section-title">Live Queues</h2>
            <span className="admin-overview__section-count">
              {liveQueues.length} Services
            </span>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Waiting</th>
                <th>Now Serving</th>
                <th>Est. Wait</th>
                <th>Counters</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveQueues.map((item) => (
                <tr key={item.serviceId}>
                  {/* Service Name */}
                  <td className="admin-table__service-name">
                    {item.serviceName}
                  </td>

                  {/* People Waiting */}
                  <td className="admin-table__mono">
                    {item.waitingCount}
                  </td>

                  {/* Now Serving */}
                  <td>
                    {item.servingTokens.length > 0 ? (
                      <div className="admin-table__tokens-list">
                        {item.servingTokens.map((tok) => (
                          <span key={tok} className="admin-table__token-tag">
                            {tok}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Estimated Waiting Time */}
                  <td className="admin-table__mono">
                    {item.estWaitFormatted}
                  </td>

                  {/* Number of Active Counters */}
                  <td className="admin-table__mono">
                    {item.activeCountersCount} Active / {item.totalCountersCount} Total
                  </td>

                  {/* Live Queue Status */}
                  <td>
                    <span
                      className={`admin-status-badge admin-status-badge--${item.status.tone}`}
                    >
                      {item.status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  3. COUNTER STATUS                                           */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-overview__section" aria-label="Counter Status">
        <div className="admin-overview__section-header">
          <div className="admin-overview__section-title-wrap">
            <h2 className="admin-overview__section-title">Counter Status</h2>
            <span className="admin-overview__section-count">
              {counterStatuses.length} Counters
            </span>
          </div>
        </div>

        <div className="admin-counters-grid">
          {counterStatuses.map((item) => {
            const isPaused = item.isPaused;
            const hasServingToken = !!item.currentToken;

            return (
              <div
                key={item.counter.id}
                className={`admin-counter-card${isPaused ? ' admin-counter-card--paused' : ''}`}
              >
                {/* Top: Counter Label & Status Badge */}
                <div className="admin-counter-card__top">
                  <span className="admin-counter-card__label">
                    {item.counter.label}
                  </span>
                  {isPaused ? (
                    <span className="counter-pill counter-pill--paused">
                      ⏸ PAUSED
                    </span>
                  ) : (
                    <span className="counter-pill counter-pill--active">
                      <span className="counter-pill__dot" /> ACTIVE
                    </span>
                  )}
                </div>

                {/* Assigned Service */}
                <div className="admin-counter-card__service">
                  {item.serviceName}
                </div>

                <div className="admin-counter-card__divider" />

                {/* Serving Status */}
                <div className="admin-counter-card__serving">
                  <span className="admin-counter-card__serving-label">
                    Serving:
                  </span>
                  {hasServingToken ? (
                    <span className="admin-counter-card__serving-token">
                      {item.currentToken?.displayNumber}
                    </span>
                  ) : (
                    <span className="admin-counter-card__serving-empty">
                      —
                    </span>
                  )}
                </div>

                {/* Footer: Staff name & served count */}
                <div className="admin-counter-card__footer">
                  <span>Staff: {item.staffName}</span>
                  <span>{item.counter.servedToday} served</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
