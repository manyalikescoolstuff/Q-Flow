import { useAdminPredictions } from '@/hooks/useQFlow';
import './Predictions.css';

/**
 * Admin Predictions page (/admin/predictions).
 *
 * Operational demand & queue forecasting answering:
 * "Based on historical operational patterns, what demand and queue conditions are likely to occur next?"
 *
 * 1. Forecast Summary KPI Cards (Predicted Footfall, Expected Peak Period, Highest Demand Service, Highest Expected Wait)
 * 2. Operational Planning Insights (Deterministic decision-support information)
 * 3. Hourly Forecast Telemetry Charts (Predicted hourly footfall & Expected average waiting time)
 * 4. Expected Service Demand & Expected Queue Pressure Breakdown
 *
 * Strictly forecast-oriented prototype modeling derived from centralized deterministic historical baselines.
 * Visually and logically separated from live monitoring (Overview/Queues/Counters) and historical logs (Analytics).
 */
export function PredictionsPage() {
  const {
    summary,
    hourlyForecast,
    peakFootfallHour,
    peakWaitHour,
    serviceDemandForecast,
    queuePressure,
    planningInsights,
  } = useAdminPredictions();

  // SVG Chart coordinate calculations for Expected Waiting Time Trend
  const svgWidth = 500;
  const svgHeight = 180;
  const padLeft = 36;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 28;

  const chartInnerWidth = svgWidth - padLeft - padRight;
  const chartInnerHeight = svgHeight - padTop - padBottom;

  // Max wait for scale (14 minutes / 840 sec)
  const maxScaleWaitSec = 840;

  const waitPoints = hourlyForecast.map((d, index) => {
    const x =
      padLeft +
      (index / Math.max(1, hourlyForecast.length - 1)) * chartInnerWidth;
    const yRatio = Math.min(1, Math.max(0, d.predictedAvgWaitSec / maxScaleWaitSec));
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
  const maxFootfall = Math.max(...hourlyForecast.map((d) => d.predictedFootfall), 1);
  const footfallScaleMax = Math.ceil(maxFootfall * 1.15);

  return (
    <div className="admin-predictions">
      {/* ------------------------------------------------------------ */}
      {/*  PAGE HEADER                                                 */}
      {/* ------------------------------------------------------------ */}
      <header className="admin-predictions__header">
        <div className="admin-predictions__title-group">
          <h1 className="admin-predictions__title">Predictions</h1>
          <span className="admin-predictions__subtitle">
            Operational Demand &amp; Queue Forecasting
          </span>
        </div>

        <div className="admin-predictions__badge-group">
          <span className="admin-predictions__period-pill">
            Next Period: {summary.forecastPeriod}
          </span>
          <div className="admin-predictions__forecast-pill">
            <span>PROTOTYPE FORECAST</span>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/*  1. FORECAST KPI SUMMARY                                     */}
      {/* ------------------------------------------------------------ */}
      <section className="admin-predictions__kpis" aria-label="Forecast Summary">
        {/* Predicted Footfall */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Predicted Footfall</span>
          <span className="admin-metric-card__value">
            {summary.predictedFootfall}
          </span>
          <span className="admin-metric-card__subtext">
            Forecast arrivals across {summary.forecastPeriod}
          </span>
        </div>

        {/* Expected Peak Period */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Expected Peak Period</span>
          <span className="admin-metric-card__value">
            {summary.expectedPeakPeriod}
          </span>
          <span className="admin-metric-card__subtext">
            Highest arrival volume (~{peakFootfallHour?.predictedFootfall ?? 24} visitors)
          </span>
        </div>

        {/* Highest Demand Service */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Highest Expected Demand</span>
          <span className="admin-metric-card__value">
            {summary.highestDemandServiceName}
          </span>
          <span className="admin-metric-card__subtext">
            {summary.highestDemandRequests} expected requests (34.4% share)
          </span>
        </div>

        {/* Highest Expected Waiting Time */}
        <div className="admin-metric-card">
          <span className="admin-metric-card__label">Highest Expected Wait</span>
          <span className="admin-metric-card__value">
            {summary.highestExpectedWaitFormatted}
          </span>
          <span className="admin-metric-card__subtext">
            {summary.highestExpectedWaitServiceName} queue pressure
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  2. OPERATIONAL PLANNING INSIGHTS (DECISION SUPPORT)         */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-predictions__insights-section"
        aria-label="Planning Insights"
      >
        <div className="admin-predictions__insights-header">
          <div className="admin-predictions__insights-title">
            <span>Operational Planning Insights</span>
            <span className="admin-predictions__insights-tag">
              Decision Support
            </span>
          </div>
        </div>

        <div className="admin-predictions__insights-grid">
          {/* Expected Peak Window */}
          <div className="admin-pred-card admin-pred-card--peak">
            <span className="admin-pred-card__type">Expected Peak Window</span>
            <span className="admin-pred-card__highlight">
              {planningInsights.expectedPeakWindow.timeWindow}
            </span>
            <span className="admin-pred-card__desc">
              {planningInsights.expectedPeakWindow.description}
            </span>
          </div>

          {/* Service With Highest Expected Demand */}
          <div className="admin-pred-card admin-pred-card--demand">
            <span className="admin-pred-card__type">Highest Expected Demand</span>
            <span className="admin-pred-card__highlight">
              {planningInsights.highestDemandService.serviceName}
            </span>
            <span className="admin-pred-card__desc">
              {planningInsights.highestDemandService.description}
            </span>
          </div>

          {/* Service With Highest Expected Wait */}
          <div className="admin-pred-card admin-pred-card--bottleneck">
            <span className="admin-pred-card__type">Highest Expected Wait</span>
            <span className="admin-pred-card__highlight">
              {planningInsights.highestExpectedWait.serviceName}
            </span>
            <span className="admin-pred-card__desc">
              {planningInsights.highestExpectedWait.description}
            </span>
          </div>

          {/* Potential Capacity Pressure */}
          <div className="admin-pred-card admin-pred-card--pressure">
            <span className="admin-pred-card__type">Potential Capacity Pressure</span>
            <span className="admin-pred-card__highlight">
              {planningInsights.capacityPressure.serviceName}
            </span>
            <span className="admin-pred-card__desc">
              {planningInsights.capacityPressure.description}
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/*  3. HOURLY TELEMETRY (FOOTFALL & WAIT TIME CHARTS)           */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-predictions__charts-grid"
        aria-label="Hourly Operational Projections"
      >
        {/* Predicted Hourly Footfall Bar Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title-wrap">
              <h2 className="admin-chart-card__title">Predicted Hourly Footfall</h2>
              <span className="admin-chart-card__subtitle">
                Projected arrival distribution by hour of day (09:00 – 17:00)
              </span>
            </div>
            {peakFootfallHour && (
              <span className="admin-chart-card__badge">
                Expected Peak: {peakFootfallHour.label} ({peakFootfallHour.predictedFootfall} pax)
              </span>
            )}
          </div>

          <div className="admin-chart-container">
            <div className="admin-bar-chart">
              {hourlyForecast.map((item) => {
                const heightPct = Math.round((item.predictedFootfall / footfallScaleMax) * 100);
                return (
                  <div
                    key={item.hour}
                    className={`admin-bar-col${item.isPeakFootfall ? ' admin-bar-col--peak' : ''}`}
                  >
                    {item.isPeakFootfall && (
                      <span className="admin-bar-col__peak-pill">PEAK</span>
                    )}
                    <span className="admin-bar-col__value">{item.predictedFootfall}</span>
                    <div className="admin-bar-col__track">
                      <div
                        className="admin-bar-col__fill"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                        title={`${item.timeRange}: ~${item.predictedFootfall} expected arrivals`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="admin-bar-labels">
              {hourlyForecast.map((item) => (
                <div
                  key={item.hour}
                  className={`admin-bar-labels__item${item.isPeakFootfall ? ' admin-bar-labels__item--peak' : ''}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expected Average Waiting Time SVG Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-card__header">
            <div className="admin-chart-card__title-wrap">
              <h2 className="admin-chart-card__title">Expected Average Waiting Time</h2>
              <span className="admin-chart-card__subtitle">
                Projected queue wait time evolution as demand fluctuates
              </span>
            </div>
            {peakWaitHour && (
              <span className="admin-chart-card__badge admin-chart-card__badge--warning">
                Peak Expected Wait: {peakWaitHour.predictedAvgWaitFormatted} at {peakWaitHour.label}
              </span>
            )}
          </div>

          <div className="admin-chart-container">
            <svg
              className="admin-chart-svg"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="predWaitAreaGrad"
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
              <polygon points={areaPoints} fill="url(#predWaitAreaGrad)" />

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
                const isPeak = pt.data.isPeakWait;
                return (
                  <g key={i}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isPeak ? 4.5 : 3.5}
                      fill={isPeak ? '#4f8cff' : '#0f1117'}
                      stroke={isPeak ? '#ffffff' : '#4f8cff'}
                      strokeWidth="2"
                    />
                    {/* Time labels on bottom */}
                    <text
                      x={pt.x}
                      y={svgHeight - 6}
                      fill={isPeak ? '#4f8cff' : '#636a78'}
                      fontSize="10"
                      fontWeight={isPeak ? '700' : '400'}
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
      {/*  4. SERVICE DEMAND & EXPECTED QUEUE PRESSURE                 */}
      {/* ------------------------------------------------------------ */}
      <section
        className="admin-predictions__split-grid"
        aria-label="Expected Demand and Queue Pressure"
      >
        {/* Expected Service Demand */}
        <div className="admin-predictions__card-section">
          <div className="admin-predictions__card-header">
            <h2 className="admin-predictions__card-title">Expected Service Demand</h2>
            <span className="admin-predictions__card-count">
              {serviceDemandForecast.length} Services
            </span>
          </div>

          <div className="admin-demand-list">
            {serviceDemandForecast.map((item) => (
              <div
                key={item.serviceId}
                className={`admin-demand-row${item.isHighest ? ' admin-demand-row--highest' : ''}`}
              >
                <div className="admin-demand-row__top">
                  <span className="admin-demand-row__name" title={item.serviceName}>
                    {item.serviceName}
                  </span>
                  <span className="admin-demand-row__vol">
                    {item.expectedRequests} Requests
                  </span>
                  <span className="admin-demand-row__pct">
                    {item.percentage}%
                  </span>
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

        {/* Expected Queue Pressure */}
        <div className="admin-predictions__card-section">
          <div className="admin-predictions__card-header">
            <h2 className="admin-predictions__card-title">Expected Queue Pressure</h2>
            <span className="admin-predictions__card-count">
              Capacity Readiness
            </span>
          </div>

          <div className="admin-predictions__pressure-wrapper">
            <table className="admin-predictions__table">
              <thead>
                <tr>
                  <th className="admin-predictions__th--service">Service</th>
                  <th className="admin-predictions__th--requests">Expected Requests</th>
                  <th className="admin-predictions__th--wait">Expected Avg. Wait</th>
                  <th className="admin-predictions__th--desks">Available Desks</th>
                  <th className="admin-predictions__th--status">Forecast Status</th>
                </tr>
              </thead>
              <tbody>
                {queuePressure.map((row) => (
                  <tr key={row.serviceId}>
                    {/* Service Name */}
                    <td className="admin-predictions__service-name">
                      {row.serviceName}
                    </td>

                    {/* Expected Requests */}
                    <td className="admin-predictions__mono admin-predictions__td--requests">
                      {row.expectedRequests}
                    </td>

                    {/* Expected Avg Wait */}
                    <td className="admin-predictions__mono admin-predictions__td--wait">
                      {row.expectedAvgWaitFormatted}
                    </td>

                    {/* Available Counters */}
                    <td className="admin-predictions__mono admin-predictions__td--desks">
                      {row.availableCounters} {row.availableCounters > 1 ? 'Counters' : 'Counter'}
                    </td>

                    {/* Forecast Load Status */}
                    <td className="admin-predictions__td--status">
                      <span
                        className={`admin-status-badge admin-status-badge--${row.statusTone}`}
                      >
                        {row.forecastLoadStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
