/**
 * A customer-facing token representing one person's place in a queue.
 */
export type TokenStatus =
  | 'WAITING'
  | 'SERVING'
  | 'COMPLETED'
  | 'MISSED';

export interface Token {
  id: string;
  /** Display number shown to customer, e.g. "D-042" */
  displayNumber: string;
  /** Which queue (and therefore service) this token belongs to */
  queueId: string;
  status: TokenStatus;
  /** ISO timestamp – when the token was issued */
  issuedAt: string;
  /** ISO timestamp – when the token began being served */
  calledAt?: string;
  /** ISO timestamp – when serving finished (completed or missed) */
  completedAt?: string;
  /** Counter that served / is serving this token */
  counterId?: string;
}
