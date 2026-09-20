import { useState, useEffect, useCallback, useRef } from 'react';
import { useStaffCounter } from '@/hooks/useQFlow';
import { useQFlowStore } from '@/mock/store';
import { formatDuration } from '@/utils/format';
import { CURRENT_STAFF_ID } from './StaffLayout';
import './StaffDashboard.css';

/**
 * Staff Dashboard — the primary operational interface for a
 * counter operator. Everything on this screen answers:
 *
 *   "What do I need to do with my queue right now?"
 */
export function StaffDashboardPage() {
  const {
    counter,
    currentToken,
    nextToken,
    upcomingTokens,
    waitingCount,
    estimatedWaitSec,
  } = useStaffCounter(CURRENT_STAFF_ID);

  const completeAndNext = useQFlowStore((s) => s.completeAndNext);
  const recallToken = useQFlowStore((s) => s.recallToken);
  const missToken = useQFlowStore((s) => s.missToken);
  const pauseCounter = useQFlowStore((s) => s.pauseCounter);
  const resumeCounter = useQFlowStore((s) => s.resumeCounter);

  /* ---------------------------------------------------------------- */
  /*  Elapsed service time                                            */
  /*  Resets to 0 whenever the current token ID changes and ticks     */
  /*  every second from that moment forward.                          */
  /* ---------------------------------------------------------------- */
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerOriginRef = useRef<number>(Date.now());

  const currentTokenId = currentToken?.id ?? null;

  useEffect(() => {
    if (!currentTokenId) {
      setElapsedSec(0);
      return;
    }

    // Reset origin to NOW whenever a new token starts being served
    timerOriginRef.current = Date.now();
    setElapsedSec(0);

    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - timerOriginRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTokenId]);

  /* ---------------------------------------------------------------- */
  /*  Action feedback toast                                           */
  /* ---------------------------------------------------------------- */
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    // Clear any existing timer so rapid actions don't stack
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2800);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  /* ---- Action handlers ---- */

  const handleCompleteAndNext = useCallback(() => {
    if (!counter || !currentToken) return;
    const prevDisplay = currentToken.displayNumber;
    completeAndNext(counter.id);
    // Read the next token that will become current AFTER store update.
    // Because upcomingTokens is from the pre-action render, the first
    // upcoming token is the one that will be promoted.
    const nextDisplay = nextToken?.displayNumber;
    showToast(
      nextDisplay
        ? `${prevDisplay} completed · Now serving ${nextDisplay}`
        : `${prevDisplay} completed · Queue empty`,
    );
  }, [counter, currentToken, nextToken, completeAndNext, showToast]);

  const handleRecall = useCallback(() => {
    if (!counter || !currentToken) return;
    recallToken(counter.id);
    showToast(`${currentToken.displayNumber} recalled`);
  }, [counter, currentToken, recallToken, showToast]);

  const handleMissed = useCallback(() => {
    if (!counter || !currentToken) return;
    const prevDisplay = currentToken.displayNumber;
    missToken(counter.id);
    const nextDisplay = nextToken?.displayNumber;
    showToast(
      nextDisplay
        ? `${prevDisplay} marked missed · Now serving ${nextDisplay}`
        : `${prevDisplay} marked missed · Queue empty`,
    );
  }, [counter, currentToken, nextToken, missToken, showToast]);

  const handlePause = useCallback(() => {
    if (!counter) return;
    pauseCounter(counter.id);
    showToast('Counter paused');
  }, [counter, pauseCounter, showToast]);

  const handleResume = useCallback(() => {
    if (!counter) return;
    resumeCounter(counter.id);
    showToast('Counter resumed');
  }, [counter, resumeCounter, showToast]);

  /* ---- Guards ---- */
  if (!counter) {
    return (
      <div className="staff-dash">
        <p className="text-muted">No counter assigned.</p>
      </div>
    );
  }

  const isPaused = counter.status === 'PAUSED';
  const hasToken = !!currentToken;
  const actionsDisabled = isPaused || !hasToken;

  /* ---- Render ---- */
  return (
    <div className="staff-dash">
      {/* ---- PAUSED banner ---- */}
      {isPaused && (
        <div className="staff-dash__paused-banner">
          ⏸ Counter is paused — queue actions are disabled
        </div>
      )}

      {/* ============================================================ */}
      {/*  LEFT — Token + Actions                                      */}
      {/* ============================================================ */}
      <div className="staff-dash__main">
        {/* ---- Current Token ---- */}
        <div
          className={`staff-token${!hasToken ? ' staff-token--empty' : ''}${isPaused ? ' staff-token--paused' : ''}`}
        >
          <span className="staff-token__label">Now Serving</span>

          <span className="staff-token__number">
            {hasToken ? currentToken.displayNumber : 'No Token'}
          </span>

          {hasToken && (
            <span className="staff-token__elapsed">
              {formatDuration(elapsedSec)}
            </span>
          )}
        </div>

        {/* ---- Actions ---- */}
        <div className="staff-actions">
          <button
            className="staff-actions__primary"
            disabled={actionsDisabled}
            onClick={handleCompleteAndNext}
          >
            Complete &amp; Next
          </button>

          <div className="staff-actions__secondary-row">
            <button
              className="staff-actions__btn"
              disabled={actionsDisabled}
              onClick={handleRecall}
            >
              Recall
            </button>

            <button
              className="staff-actions__btn staff-actions__btn--danger"
              disabled={actionsDisabled}
              onClick={handleMissed}
            >
              Missed
            </button>

            {isPaused ? (
              <button
                className="staff-actions__btn staff-actions__btn--resume"
                onClick={handleResume}
              >
                Resume Counter
              </button>
            ) : (
              <button
                className="staff-actions__btn staff-actions__btn--warning"
                onClick={handlePause}
              >
                Pause Counter
              </button>
            )}
          </div>

          {/* Action feedback toast */}
          {toastMsg && (
            <div className="staff-toast" key={toastMsg}>
              {toastMsg}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  RIGHT — Queue Overview + Today Stats                        */}
      {/* ============================================================ */}
      <div className="staff-dash__side">
        {/* ---- Queue Overview ---- */}
        <div className="staff-queue">
          <div className="staff-queue__metrics">
            <div className="staff-queue__metric">
              <div className="staff-queue__metric-value">{waitingCount}</div>
              <div className="staff-queue__metric-label">Waiting</div>
            </div>
            <div className="staff-queue__metric-divider" />
            <div className="staff-queue__metric">
              <div className="staff-queue__metric-value">
                ~{formatDuration(estimatedWaitSec)}
              </div>
              <div className="staff-queue__metric-label">Est. Wait</div>
            </div>
          </div>

          <div className="staff-queue__divider" />

          {nextToken ? (
            <>
              <div className="staff-queue__next">
                <div className="staff-queue__next-label">Next</div>
                <div className="staff-queue__next-token">
                  {nextToken.displayNumber}
                </div>
              </div>

              {upcomingTokens.length > 1 && (
                <div className="staff-queue__upcoming">
                  <div className="staff-queue__upcoming-label">Upcoming</div>
                  <div className="staff-queue__upcoming-list">
                    {upcomingTokens.slice(1).map((tok, i) => (
                      <div key={tok.id} className="staff-queue__upcoming-item">
                        <span className="staff-queue__upcoming-pos">
                          {i + 2}
                        </span>
                        <span className="staff-queue__upcoming-num">
                          {tok.displayNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="staff-queue__empty">Queue is empty</div>
          )}
        </div>

        {/* ---- Today Stats ---- */}
        <div className="staff-today">
          <div className="staff-today__title">Today</div>

          <div className="staff-today__row">
            <span className="staff-today__label">Customers Served</span>
            <span className="staff-today__value">{counter.servedToday}</span>
          </div>

          <div className="staff-today__row">
            <span className="staff-today__label">Avg. Service Time</span>
            <span className="staff-today__value">
              {counter.avgServiceTimeSec > 0
                ? formatDuration(counter.avgServiceTimeSec)
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
