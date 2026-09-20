/**
 * A queue groups all tokens for a particular service.
 * There is a 1:1 relationship between a Queue and a Service.
 */
export interface Queue {
  id: string;
  serviceId: string;
  /** Ordered list of token IDs currently in the queue (WAITING only) */
  waitingTokenIds: string[];
  /** Recent historical waiting counts for deterministic trend calculation [e.g. 15m ago, 5m ago] */
  recentHistory?: number[];
}
