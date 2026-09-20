/**
 * A physical service counter operated by a staff member.
 */
export type CounterStatus = 'ACTIVE' | 'PAUSED';

export interface Counter {
  id: string;
  /** Display label, e.g. "Counter 03" */
  label: string;
  /** The service this counter is currently handling */
  serviceId: string;
  /** The queue this counter pulls tokens from */
  queueId: string;
  status: CounterStatus;
  /** Staff member currently assigned to this counter */
  staffId: string;
  /** Token currently being served (null if none) */
  currentTokenId: string | null;
  /** Tokens served today at this counter */
  servedToday: number;
  /** Rolling average service time in seconds */
  avgServiceTimeSec: number;
  /** Counter operational utilization rate percentage (0-100) */
  utilizationRate?: number;
  /** Epoch timestamp (ms) when the current token began service, or null if idle/paused */
  servingStartedAt?: number | null;
}
