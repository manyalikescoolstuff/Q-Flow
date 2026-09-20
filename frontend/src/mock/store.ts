/**
 * Centralized Zustand store for Q-FLOW mock state.
 *
 * Both Staff and Admin dashboards subscribe to the same store,
 * ensuring state consistency (e.g. Staff pauses Counter 03 →
 * Admin immediately sees it as PAUSED).
 *
 * When the backend is introduced this store will be replaced by
 * API calls + WebSocket subscriptions, but the action signatures
 * and data shapes will stay compatible.
 */

import { create } from 'zustand';

import type {
  Service,
  Token,
  Queue,
  Counter,
  Staff,
  AnalyticsSnapshot,
  PredictionSnapshot,
} from '@/models';

import {
  SEED_SERVICES,
  SEED_TOKENS,
  SEED_QUEUES,
  SEED_COUNTERS,
  SEED_STAFF,
  SEED_ANALYTICS,
  SEED_PREDICTIONS,
} from '@/mock/data/seed';

/* ------------------------------------------------------------------ */
/*  State shape                                                       */
/* ------------------------------------------------------------------ */

export interface QFlowState {
  services: Record<string, Service>;
  tokens: Record<string, Token>;
  queues: Record<string, Queue>;
  counters: Record<string, Counter>;
  staff: Record<string, Staff>;
  analytics: AnalyticsSnapshot;
  predictions: PredictionSnapshot;

  /* ---- Staff actions ---- */

  /** Mark current token as COMPLETED, pull next WAITING token from queue. */
  completeAndNext: (counterId: string) => void;

  /** Re-call the current token (no state change, but could trigger a notification). */
  recallToken: (counterId: string) => void;

  /** Mark current token as MISSED, pull next WAITING token from queue. */
  missToken: (counterId: string) => void;

  /** Pause the counter (stop serving). */
  pauseCounter: (counterId: string) => void;

  /** Resume the counter. */
  resumeCounter: (counterId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Pull the next waiting token from the queue and assign it to the counter. */
function pullNextToken(
  tokens: Record<string, Token>,
  queue: Queue,
  counterId: string,
): { updatedTokens: Record<string, Token>; nextTokenId: string | null; updatedQueue: Queue } {
  const updatedQueue = { ...queue, waitingTokenIds: [...queue.waitingTokenIds] };
  const nextTokenId = updatedQueue.waitingTokenIds.shift() ?? null;

  const updatedTokens = { ...tokens };

  if (nextTokenId && updatedTokens[nextTokenId]) {
    updatedTokens[nextTokenId] = {
      ...updatedTokens[nextTokenId],
      status: 'SERVING',
      calledAt: new Date().toISOString(),
      counterId,
    };
  }

  return { updatedTokens, nextTokenId, updatedQueue };
}

/* ------------------------------------------------------------------ */
/*  Store                                                             */
/* ------------------------------------------------------------------ */

export const useQFlowStore = create<QFlowState>((set) => ({
  services: { ...SEED_SERVICES },
  tokens: { ...SEED_TOKENS },
  queues: { ...SEED_QUEUES },
  counters: { ...SEED_COUNTERS },
  staff: { ...SEED_STAFF },
  analytics: { ...SEED_ANALYTICS },
  predictions: { ...SEED_PREDICTIONS },

  /* ---------------------------------------------------------------- */
  completeAndNext: (counterId) =>
    set((state) => {
      const counter = state.counters[counterId];
      if (!counter) return state;

      const updatedTokens = { ...state.tokens };

      // Mark current token as COMPLETED
      if (counter.currentTokenId && updatedTokens[counter.currentTokenId]) {
        updatedTokens[counter.currentTokenId] = {
          ...updatedTokens[counter.currentTokenId],
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        };
      }

      // Pull next token
      const queue = state.queues[counter.queueId];
      const {
        updatedTokens: tokensAfterPull,
        nextTokenId,
        updatedQueue,
      } = pullNextToken(updatedTokens, queue, counterId);

      return {
        tokens: tokensAfterPull,
        queues: { ...state.queues, [queue.id]: updatedQueue },
        counters: {
          ...state.counters,
          [counterId]: {
            ...counter,
            currentTokenId: nextTokenId,
            servedToday: counter.servedToday + 1,
            servingStartedAt: nextTokenId ? Date.now() : null,
          },
        },
      };
    }),

  /* ---------------------------------------------------------------- */
  recallToken: (_counterId) => {
    // In the mock layer a recall is a no-op on state.
    // A real implementation would trigger a notification / display event.
  },

  /* ---------------------------------------------------------------- */
  missToken: (counterId) =>
    set((state) => {
      const counter = state.counters[counterId];
      if (!counter) return state;

      const updatedTokens = { ...state.tokens };

      // Mark current token as MISSED
      if (counter.currentTokenId && updatedTokens[counter.currentTokenId]) {
        updatedTokens[counter.currentTokenId] = {
          ...updatedTokens[counter.currentTokenId],
          status: 'MISSED',
          completedAt: new Date().toISOString(),
        };
      }

      // Pull next token
      const queue = state.queues[counter.queueId];
      const {
        updatedTokens: tokensAfterPull,
        nextTokenId,
        updatedQueue,
      } = pullNextToken(updatedTokens, queue, counterId);

      return {
        tokens: tokensAfterPull,
        queues: { ...state.queues, [queue.id]: updatedQueue },
        counters: {
          ...state.counters,
          [counterId]: {
            ...counter,
            currentTokenId: nextTokenId,
            servingStartedAt: nextTokenId ? Date.now() : null,
          },
        },
      };
    }),

  /* ---------------------------------------------------------------- */
  pauseCounter: (counterId) =>
    set((state) => {
      const counter = state.counters[counterId];
      if (!counter) return state;

      return {
        counters: {
          ...state.counters,
          [counterId]: { ...counter, status: 'PAUSED' },
        },
      };
    }),

  /* ---------------------------------------------------------------- */
  resumeCounter: (counterId) =>
    set((state) => {
      const counter = state.counters[counterId];
      if (!counter) return state;

      return {
        counters: {
          ...state.counters,
          [counterId]: { ...counter, status: 'ACTIVE' },
        },
      };
    }),
}));
