import { useState } from 'react';
import { useAdminQueues } from '@/hooks/useQFlow';
import './Queues.css';

/**
 * Admin Queues page (/admin/queues).
 *
 * Operational queue monitoring page answering:
 * "What is happening inside each service queue right now, and which queues need attention?"
 *
 * 1. Queue summary metrics (Total Waiting, Active Queues, Busiest Queue, Highest Wait)
 * 2. Live service queues table with trend indicators and status badges
 * 3. Compact interactive detail panel for inspecting the selected queue & next 3 tokens
 *
 * All values derive directly from shared Zustand store state.
 * Read-only monitoring — no queue manipulation controls.
 */
export function QueuesPage() {
  const { summary, queues } = useAdminQueues();

  // Pre-select the first queue, or allow admin to select any row
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    queues[0]?.serviceId ?? '',
  );

  // Find currently selected queue row (fallback to first if unselected)
  const selectedQueue =
    queues.find((q) => q.serviceId === selectedServiceId) ?? queues[0];

  return (
    <div className="admin-queues">
      {/* ------------------------------------------------------------ */}
      {/*  PAGE HEADER                                                 */}
      {/* ------------------------------------------------------------ */}
      <header className="admin-queues__header">
        <div className="admin-queues__title-group">
          <h1 className="admin-queues__title">Queues</h1>
          <span className="admin-queues__subtitle">
            Live Service Queue Telemetry &amp; Load Monitoring
          </span>
        </div>

        <div className="admin-queues__live-pill">
          <span className="admin-queues__live-dot" />
          <span>LIVE</span>
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  1. QUEUE SUMMARY METRICS                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-queues__summary" aria-label="Queue Summary">
        {/* Total Waiting */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Total Waiting</span>
          <span className="admin-metric-card__value">{summary.totalWaiting}</span>
          <span className="admin-metric-card__subtext">
            Across {summary.totalQueuesCount} service queues
          </span>
        </div>

        {/* Number of Active Queues */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Active Queues</span>
          <span className="admin-metric-card__value">
            {summary.activeQueuesCount} / {summary.totalQueuesCount}
          </span>
          <span className="admin-metric-card__subtext">
            Queues with active counters or waiting lines
          </span>
        </div>

        {/* Busiest Queue */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Busiest Queue</span>
          <span className="admin-metric-card__value">
            {summary.busiestQueueWaiting > 0
              ? `${summary.busiestQueueWaiting} waiting`
              : 'None'}
          </span>
          <span className="admin-metric-card__subtext">
            {summary.busiestQueueName}
          </span>
        </div>

        {/* Highest Current Wait */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Highest Wait</span>
          <span className="admin-metric-card__value">
            {summary.highestWaitFormatted}
          </span>
          <span className="admin-metric-card__subtext">
            {summary.highestWaitServiceName}
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  2. LIVE SERVICE QUEUES TABLE                                */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-queues__section" aria-label="Live Service Queues">
        <div className="admin-queues__section-header">
          <div className="admin-queues__section-title-wrap">
            <h2 className="admin-queues__section-title">Live Service Queues</h2>
          </div>
          <span className="admin-queues__hint">
            Click any row to inspect queue details below
          </span>
        </div>

        <div className="admin-queues__table-wrapper">
          <table className="admin-queues__table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Waiting</th>
                <th>Now Serving</th>
                <th>Est. Wait</th>
                <th>Avg. Service Time</th>
                <th>Counters</th>
                <th>Missed</th>
                <th>Trend</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((item) => {
                const isSelected = item.serviceId === selectedQueue?.serviceId;

                return (
                  <tr
                    key={item.serviceId}
                    className={`admin-queues__tr${isSelected ? ' admin-queues__tr--selected' : ''}`}
                    onClick={() => setSelectedServiceId(item.serviceId)}
                    title={`Click to view ${item.serviceName} details`}
                  >
                    {/* Service Name */}
                    <td className="admin-queues__service-name">
                      {item.serviceName}
                    </td>

                    {/* Waiting Customers */}
                    <td className="admin-queues__mono">
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

                    {/* Estimated Wait */}
                    <td className="admin-queues__mono">
                      {item.estWaitFormatted}
                    </td>

                    {/* Average Service Time */}
                    <td className="admin-queues__mono">
                      {item.avgServiceTimeFormatted}
                    </td>

                    {/* Active / Total Counters */}
                    <td className="admin-queues__mono">
                      {item.activeCountersCount} Active / {item.totalCountersCount} Total
                    </td>

                    {/* Missed Tokens */}
                    <td className="admin-queues__mono">
                      {item.missedCount}
                    </td>

                    {/* Live Trend Indicator */}
                    <td>
                      <span
                        className={`trend-pill trend-pill--${item.trend.direction.toLowerCase()}`}
                      >
                        <span className="trend-pill__symbol">
                          {item.trend.symbol}
                        </span>
                        <span>{item.trend.label}</span>
                      </span>
                    </td>

                    {/* Queue Status */}
                    <td>
                      <span
                        className={`admin-status-badge admin-status-badge--${item.status.tone}`}
                      >
                        {item.status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  3. QUEUE DETAIL PANEL                                       */}
      {/* ------------------------------------------------------------ */}
      {selectedQueue && (
        <section
          className="admin-queue-detail"
          aria-label={`Queue Details for ${selectedQueue.serviceName}`}
        >
          {/* Header */}
          <div className="admin-queue-detail__header">
            <div className="admin-queue-detail__title-group">
              <h2 className="admin-queue-detail__title">
                {selectedQueue.serviceName}
              </h2>
            </div>

            <div className="admin-queue-detail__badge-group">
              {/* Trend Pill */}
              <span
                className={`trend-pill trend-pill--${selectedQueue.trend.direction.toLowerCase()}`}
              >
                <span className="trend-pill__symbol">
                  {selectedQueue.trend.symbol}
                </span>
                <span>{selectedQueue.trend.label}</span>
              </span>

              {/* Status Badge */}
              <span
                className={`admin-status-badge admin-status-badge--${selectedQueue.status.tone}`}
              >
                {selectedQueue.status.label}
              </span>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="admin-queue-detail__grid">
            {/* Current Token */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Now Serving</span>
              <span className="admin-queue-detail__stat-value admin-queue-detail__stat-value--accent">
                {selectedQueue.servingTokens.length > 0
                  ? selectedQueue.servingTokens.join(', ')
                  : '—'}
              </span>
            </div>

            {/* Waiting Count */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Waiting Count</span>
              <span className="admin-queue-detail__stat-value">
                {selectedQueue.waitingCount}
              </span>
            </div>

            {/* Estimated Wait */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Est. Wait</span>
              <span className="admin-queue-detail__stat-value">
                {selectedQueue.estWaitFormatted}
              </span>
            </div>

            {/* Active Counters */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Counters</span>
              <span className="admin-queue-detail__stat-value">
                {selectedQueue.activeCountersCount} Active / {selectedQueue.totalCountersCount} Total
              </span>
            </div>

            {/* Average Service Time */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Avg Service Time</span>
              <span className="admin-queue-detail__stat-value">
                {selectedQueue.avgServiceTimeFormatted}
              </span>
            </div>

            {/* Missed Tokens */}
            <div className="admin-queue-detail__stat">
              <span className="admin-queue-detail__stat-label">Missed Tokens</span>
              <span className="admin-queue-detail__stat-value">
                {selectedQueue.missedCount}
              </span>
            </div>
          </div>

          {/* Next 3 Waiting Tokens */}
          <div className="admin-queue-detail__upcoming-section">
            <span className="admin-queue-detail__upcoming-title">
              Next in Queue (First 3 Customers)
            </span>

            {selectedQueue.next3Tokens.length > 0 ? (
              <div className="admin-queue-detail__tokens-row">
                {selectedQueue.next3Tokens.map((tok, idx) => (
                  <div key={tok.id} className="admin-queue-detail__token-card">
                    <div className="admin-queue-detail__token-pos">
                      <span className="admin-queue-detail__pos-badge">
                        #{idx + 1}
                      </span>
                      <span className="admin-queue-detail__pos-label">
                        {idx === 0 ? 'Next' : `Position ${idx + 1}`}
                      </span>
                    </div>
                    <span className="admin-queue-detail__token-num">
                      {tok.displayNumber}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-queue-detail__empty">
                Queue is currently empty — no customers waiting.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
