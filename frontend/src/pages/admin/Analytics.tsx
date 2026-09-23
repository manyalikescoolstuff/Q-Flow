import { useAdminAnalytics } from '@/hooks/useQFlow';
import './Analytics.css';

/**
 * Admin Analytics page (/admin/analytics).
 *
 * Historical operational analytics answering:
 * "What operational patterns have occurred in this service centre, and where are the bottlenecks?"
 *
 * 1. KPI Summary Cards (Total Visitors Today, Avg Wait Time, Avg Service Time, Avg Counter Utilization)
 * 2. Deterministic Peak-Hour & Bottleneck Insights (Computed strictly from dataset, no AI)
 * 3. Hourly Operational Telemetry Charts (Footfall by hour & Waiting time trend)
 * 4. Service Demand & Counter Utilization Breakdown
 * 5. Service Performance Matrix Table
 *
 * Strictly historical and current aggregated operational data.
 * Zero future predictions or forecast modeling (forecasts belong strictly to /admin/predictions).
 */
export function AnalyticsPage() {
  const {
    summary,
    hourlyData,
    peakHourData,
    serviceDemand,
    counterUtilization,
    servicePerformance,
    insights,
  } = useAdminAnalytics();

  // SVG Chart coordinate calculations for Waiting Time Trend
  const svgWidth = 500;
  const svgHeight = 180;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 28;

  const chartInnerWidth = svgWidth - padLeft - padRight;
  const chartInnerHeight = svgHeight - padTop - padBottom;

  // Max wait for scale (12 minutes / 720 sec)
  const maxScaleWaitSec = 720;

  const waitPoints = hourlyData.map((d, index) => {
    const x =
      padLeft +
      (index / Math.max(1, hourlyData.length - 1)) * chartInnerWidth;
    const yRatio = Math.min(1, Math.max(0, d.avgWaitSec / maxScaleWaitSec));
    const y = padTop + chartInnerHeight - yRatio * chartInnerHeight;
    return { x, y, data: d };
  });

  const polylinePoints = waitPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const areaPoints = [
    `${padLeft},${padTop + chartInnerHeight}`,
    polylinePoints,
    `${padLeft + chartInnerWidth},${padTop + chartInnerHeight}`,
  ].join(' ');

  // Benchmark reference line (8 min / 480 sec)
  const benchmarkY =
    padTop + chartInnerHeight - (480 / maxScaleWaitSec) * chartInnerHeight;

  // Max footfall for bar chart scale
  const maxFootfall = Math.max(...hourlyData.map((d) => d.footfall), 1);
  const footfallScaleMax = Math.ceil(maxFootfall * 1.15);

  return (
    <div className="admin-analytics">
      {/* ------------------------------------------------------------ */}
      {/*  PAGE HEADER                                                 */}
      {/* ------------------------------------------------------------ */}
      <header className="admin-analytics__header">
        <div className="admin-analytics__title-group">
          <h1 className="admin-analytics__title">Analytics</h1>
          <span className="admin-analytics__subtitle">
            Historical Operational Telemetry &amp; Performance Bottlenecks
          </span>
        </div>

        <div className="admin-analytics__badge-group">
          <span className="admin-analytics__period-pill">
            09:00 – 17:00
          </span>
          <div className="admin-analytics__historical-pill">
            <span>HISTORICAL LOG</span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  1. ANALYTICS KPI SUMMARY                                    */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-analytics__kpis" aria-label="Analytics Summary">
        {/* Total Visitors Today */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Total Visitors Today</span>
          <span className="admin-metric-card__value">
            {summary.totalVisitorsToday}
          </span>
          <span className="admin-metric-card__subtext">
            Aggregated arrivals across operational hours
          </span>
        </div>

        {/* Average Waiting Time */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Average Waiting Time</span>
          <span className="admin-metric-card__value">
            {summary.avgWaitTimeFormatted}
          </span>
          <span className="admin-metric-card__subtext">
            Weighted across {summary.totalServedToday} completed tokens
          </span>
        </div>

        {/* Average Service Time */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Average Service Time</span>
          <span className="admin-metric-card__value">
            {summary.avgServiceTimeFormatted}
          </span>
          <span className="admin-metric-card__subtext">
            Weighted handling duration per token
          </span>
        </div>

        {/* Average Counter Utilization */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Counter Utilization</span>
          <span className="admin-metric-card__value">
            {summary.avgCounterUtilization}%
          </span>
          <span className="admin-metric-card__subtext">
            {summary.activeCountersCount} of {summary.totalCountersCount} active desks (paused at 0%)
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  2. PEAK-HOUR & OPERATIONAL INSIGHTS (DETERMINISTIC)         */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-analytics__insights-section"
        aria-label="Operational Insights"
      >
        <div className="admin-analytics__insights-header">
          <div className="admin-analytics__insights-title">
            <span>Operational Pattern Insights</span>
            <span className="admin-analytics__insights-tag">
              Computed from Logs
            </span>
          </div>
        </div>

        <div className="admin-analytics__insights-grid">
          {/* Peak Footfall */}
          <div className="admin-insight-card admin-insight-card--peak">
            <span className="admin-insight-card__type">Peak Footfall Window</span>
            <span className="admin-insight-card__highlight">
              {insights.peakFootfall.timeWindow}
            </span>
            <span className="admin-insight-card__desc">
              {insights.peakFootfall.description}
            </span>
          </div>

          {/* Highest Demand Service */}
          <div className="admin-insight-card admin-insight-card--demand">
            <span className="admin-insight-card__type">Highest Demand Service</span>
            <span className="admin-insight-card__highlight">
              {insights.highestDemandService.serviceName}
            </span>
            <span className="admin-insight-card__desc">
              {insights.highestDemandService.requestsCount} requests ({insights.highestDemandService.percentage}% of centre volume)
            </span>
          </div>

          {/* Highest Service Avg Wait */}
          <div className="admin-insight-card admin-insight-card--bottleneck">
            <span className="admin-insight-card__type">Highest Service Avg. Wait</span>
            <span className="admin-insight-card__highlight">
              {insights.highestServiceAvgWait.serviceName}
            </span>
            <span className="admin-insight-card__desc">
              Service average wait reached {insights.highestServiceAvgWait.avgWaitFormatted} (benchmark 8m 00s)
            </span>
          </div>

          {/* Highest Counter Utilization */}
          <div className="admin-insight-card admin-insight-card--util">
            <span className="admin-insight-card__type">Peak Counter Load</span>
            <span className="admin-insight-card__highlight">
              {insights.busiestCounter.counterLabel} ({insights.busiestCounter.utilizationRate}%)
            </span>
            <span className="admin-insight-card__desc">
              Assigned to {insights.busiestCounter.serviceName} desk
            </span>
          </div>
        </div>
      </section>


      {/* ------------------------------------------------------------ */}
      {/*  3. HOURLY TELEMETRY (FOOTFALL & WAIT TIME CHARTS)           */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-analytics__charts-grid"
        aria-label="Hourly Operational Trends"
      >
        {/* Hourly Footfall Bar Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title-wrap">
              <h2 className="admin-chart-card__title">Hourly Visitor Footfall</h2>
              <span className="admin-chart-card__subtitle">
                Arrival distribution by hour of day (09:00 – 17:00)
              </span>
            </div>
            {peakHourData && (
              <span className="admin-chart-card__badge">
                Peak: {peakHourData.label} ({peakHourData.footfall} pax)
              </span>
            )}
          </div>

          <div className="admin-chart-container">
            <div className="admin-bar-chart">
              {hourlyData.map((item) => {
                const heightPct = Math.round((item.footfall / footfallScaleMax) * 100);
                return (
                  <div
                    key={item.hour}
                    className={`admin-bar-col${item.isPeak ? ' admin-bar-col--peak' : ''}`}
                  >
                    {item.isPeak && (
                      <span className="admin-bar-col__peak-pill">PEAK</span>
                    )}
                    <span className="admin-bar-col__value">{item.footfall}</span>
                    <div className="admin-bar-col__track">
                      <div
                        className="admin-bar-col__fill"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                        title={`${item.timeRange}: ${item.footfall} visitors`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="admin-bar-labels">
              {hourlyData.map((item) => (
                <div
                  key={item.hour}
                  className={`admin-bar-labels__item${item.isPeak ? ' admin-bar-labels__item--peak' : ''}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Waiting Time Trend SVG Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title-wrap">
              <h2 className="admin-chart-card__title">Waiting Time Trend</h2>
              <span className="admin-chart-card__subtitle">
                Average waiting time evolution across operating hours
              </span>
            </div>
            <span className="admin-chart-card__badge admin-chart-card__badge--warning">
              Peak Hourly Avg. Wait: 10m at 11:00
            </span>
          </div>

          <div className="admin-chart-container">
            <svg
              className="admin-chart-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="waitAreaGrad"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#4f8cff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Grid Lines & Y-axis labels */}
              {[180, 360, 540, 720].map((sec) => {
                const y =
                  padTop +
                  chartInnerHeight -
                  (sec / maxScaleWaitSec) * chartInnerHeight;
                const minLabel = `${sec / 60}m`;
                return (
                  <g key={sec}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + chartInnerWidth}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.07)"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={padLeft - 6}
                      y={y + 3}
                      fill="#636a78"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="end"
                    >
                      {minLabel}
                    </text>
                  </g>
                );
              })}

              {/* Benchmark Guideline (8 min / 480s) */}
              <line
                x1={padLeft}
                y1={benchmarkY}
                x2={padLeft + chartInnerWidth}
                y2={benchmarkY}
                stroke="#f0ad4e"
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity="0.6"
              />
              <text
                x={padLeft + chartInnerWidth - 4}
                y={benchmarkY - 4}
                fill="#f0ad4e"
                fontSize="9"
                fontFamily="Inter, sans-serif"
                fontWeight="600"
                textAnchor="end"
                opacity="0.8"
              >
                Benchmark (8m)
              </text>

              {/* Area Gradient Fill */}
              <polygon points={areaPoints} fill="url(#waitAreaGrad)" />

              {/* Trend Polyline */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#4f8cff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points & Tooltip Labels */}
              {waitPoints.map((pt, i) => {
                const isMax = pt.data.hour === 11;
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isMax ? 4.5 : 3.5}
                      fill={isMax ? '#4f8cff' : '#0f1117'}
                      stroke={isMax ? '#ffffff' : '#4f8cff'}
                      strokeWidth="2"
                    />
                    {/* Time labels on bottom */}
                    <text
                      x={pt.x}
                      y={svgHeight - 6}
                      fill={isMax ? '#4f8cff' : '#636a78'}
                      fontSize="10"
                      fontWeight={isMax ? '700' : '400'}
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                    >
                      {pt.data.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  4. SERVICE DEMAND & COUNTER UTILIZATION                     */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-analytics__split-grid"
        aria-label="Service Demand and Counter Utilization"
      >
        {/* Service Demand Breakdown */}
        <div className="admin-analytics__card-section">
          <div className="admin-analytics__card-header">
            <h2 className="admin-analytics__card-title">Service Demand Volume</h2>
            <span className="admin-analytics__card-count">
              {serviceDemand.length} Services
            </span>
          </div>

          <div className="admin-demand-list">
            {serviceDemand.map((item) => (
              <div
                key={item.serviceId}
                className={`admin-demand-row${item.isHighest ? ' admin-demand-row--highest' : ''}`}
              >
                <div className="admin-demand-row__top">
                  <span className="admin-demand-row__name">
                    {item.serviceName}
                  </span>
                  <div className="admin-demand-row__stats">
                    <span className="admin-demand-row__vol">
                      {item.tokensGenerated} Requests
                    </span>
                    <span className="admin-demand-row__pct">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="admin-demand-row__bar-track">
                  <div
                    className="admin-demand-row__bar-fill"
                    style={{ width: `${Math.min(100, Math.max(4, item.percentage * 2.5))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Utilization Telemetry */}
        <div className="admin-analytics__card-section">
          <div className="admin-analytics__card-header">
            <h2 className="admin-analytics__card-title">Counter Utilization</h2>
            <span className="admin-analytics__card-count">
              {counterUtilization.length} Workstations
            </span>
          </div>

          <div className="admin-util-list">
            {counterUtilization.map((item) => (
              <div
                key={item.counterId}
                className={`admin-util-row${item.isPaused ? ' admin-util-row--paused' : ''}`}
              >
                <div className="admin-util-row__info">
                  <div className="admin-util-row__label">
                    {item.counterLabel}
                  </div>
                  <div className="admin-util-row__sub">
                    {item.serviceName} • {item.staffName}
                  </div>
                </div>

                <div className="admin-util-row__metrics">
                  <span className="admin-util-row__pct">
                    {item.isPaused ? 'PAUSED' : `${item.utilizationRate}%`}
                  </span>
                  <div className="admin-util-row__bar-track">
                    <div
                      className={`admin-util-row__bar-fill${item.utilizationRate >= 85 ? ' admin-util-row__bar-fill--high' : ''}${item.isPaused ? ' admin-util-row__bar-fill--paused' : ''}`}
                      style={{
                        width: `${item.isPaused ? 0 : Math.min(100, item.utilizationRate)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  5. SERVICE PERFORMANCE MATRIX                               */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-analytics__table-section"
        aria-label="Service Performance Matrix"
      >
        <div className="admin-analytics__table-header">
          <div className="admin-analytics__table-title-wrap">
            <h2 className="admin-analytics__table-title">
              Service Performance &amp; Operational Efficiency
            </h2>
          </div>
        </div>

        <div className="admin-analytics__table-wrapper">
          <table className="admin-analytics__table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Requests (Demand)</th>
                <th>Completed (Served)</th>
                <th>Waiting</th>
                <th>Avg. Wait Time</th>
                <th>Avg. Service Time</th>
                <th>Missed Tokens</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {servicePerformance.map((row) => (
                <tr key={row.serviceId}>
                  {/* Service Name */}
                  <td className="admin-analytics__service-name">
                    {row.serviceName}
                  </td>

                  {/* Requests Generated (Demand) */}
                  <td className="admin-analytics__mono">
                    {row.tokensGenerated}
                  </td>

                  {/* Customers Served */}
                  <td className="admin-analytics__mono">
                    {row.customersServed} Served
                  </td>

                  {/* Currently Waiting */}
                  <td className="admin-analytics__mono">
                    {row.currentlyWaiting > 0 ? (
                      <span>{row.currentlyWaiting}</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>

                  {/* Average Wait Time */}
                  <td className="admin-analytics__mono">
                    {row.avgWaitFormatted}
                  </td>

                  {/* Average Service Time */}
                  <td className="admin-analytics__mono">
                    {row.avgServiceFormatted}
                  </td>

                  {/* Missed Tokens */}
                  <td className="admin-analytics__mono">
                    {row.missedTokens > 0 ? (
                      <span className="text-secondary">{row.missedTokens} missed</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`admin-status-badge admin-status-badge--${row.status.tone}`}
                    >
                      {row.status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

