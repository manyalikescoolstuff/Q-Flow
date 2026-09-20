/**
 * Utility functions for Q-FLOW frontend.
 */

/**
 * Format seconds into a human-readable string.
 * e.g. 420 → "7m 00s", 90 → "1m 30s", 3600 → "1h 00m"
 */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds < 0) return '—';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Format elapsed seconds into mm:ss timer format.
 * e.g. 222 → "03:42", 290 → "04:50", 560 → "09:20"
 */
export function formatTimer(totalSeconds: number): string {
  if (totalSeconds < 0) return '—';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format a Date or ISO string to a short time display.
 * e.g. "09:34 AM"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Estimate wait time in seconds based on position in queue and
 * average service time.
 */
export function estimateWaitSec(
  positionInQueue: number,
  avgServiceTimeSec: number,
): number {
  return positionInQueue * avgServiceTimeSec;
}
