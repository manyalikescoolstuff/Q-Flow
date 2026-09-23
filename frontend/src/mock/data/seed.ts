/**
 * Deterministic seed data for the Q-FLOW prototype.
 *
 * This file defines the initial state of the service centre:
 * 5 services, 6 counters, queues with realistic token distributions,
 * plus analytics and prediction snapshots.
 *
 * All data here is plain objects – the Zustand store imports and owns them.
 */

import type {
  Service,
  Token,
  Queue,
  Counter,
  Staff,
  AnalyticsSnapshot,
  PredictionSnapshot,
} from '@/models';

/* ------------------------------------------------------------------ */
/*  SERVICES                                                          */
/* ------------------------------------------------------------------ */
export const SEED_SERVICES: Record<string, Service> = {
  'svc-aadhaar': {
    id: 'svc-aadhaar',
    name: 'Aadhaar Update',
    expectedDurationSec: 300,
  },
  'svc-pan': {
    id: 'svc-pan',
    name: 'PAN Card',
    expectedDurationSec: 240,
  },
  'svc-income': {
    id: 'svc-income',
    name: 'Income Certificate',
    expectedDurationSec: 360,
  },
  'svc-domicile': {
    id: 'svc-domicile',
    name: 'Domicile Certificate',
    expectedDurationSec: 420,
  },
  'svc-land': {
    id: 'svc-land',
    name: 'Land Records',
    expectedDurationSec: 480,
  },
};

/* ------------------------------------------------------------------ */
/*  TOKENS                                                            */
/* ------------------------------------------------------------------ */
const today = new Date();
today.setHours(9, 0, 0, 0);

export const STORE_BOOT_TIME = Date.now();

function makeIso(minutesOffset: number): string {
  const d = new Date(today);
  d.setMinutes(d.getMinutes() + minutesOffset);
  return d.toISOString();
}

function makeRecentIso(secondsAgo: number): string {
  return new Date(STORE_BOOT_TIME - secondsAgo * 1000).toISOString();
}

export const SEED_TOKENS: Record<string, Token> = {
  // ---- Aadhaar queue ----
  'tok-000': {
    id: 'tok-000',
    displayNumber: 'D-040',
    queueId: 'q-aadhaar',
    status: 'MISSED',
    issuedAt: makeIso(1),
    calledAt: makeIso(5),
    completedAt: makeIso(7),
    counterId: 'ctr-01',
  },
  'tok-001': {
    id: 'tok-001',
    displayNumber: 'D-038',
    queueId: 'q-aadhaar',
    status: 'COMPLETED',
    issuedAt: makeIso(0),
    calledAt: makeIso(2),
    completedAt: makeIso(7),
    counterId: 'ctr-01',
  },
  'tok-002': {
    id: 'tok-002',
    displayNumber: 'D-039',
    queueId: 'q-aadhaar',
    status: 'COMPLETED',
    issuedAt: makeIso(3),
    calledAt: makeIso(8),
    completedAt: makeIso(14),
    counterId: 'ctr-01',
  },
  'tok-003': {
    id: 'tok-003',
    displayNumber: 'D-042',
    queueId: 'q-aadhaar',
    status: 'SERVING',
    issuedAt: makeIso(10),
    calledAt: makeRecentIso(222), // 03:42 ago
    counterId: 'ctr-01',
  },
  'tok-004': {
    id: 'tok-004',
    displayNumber: 'D-043',
    queueId: 'q-aadhaar',
    status: 'WAITING',
    issuedAt: makeIso(12),
  },
  'tok-005': {
    id: 'tok-005',
    displayNumber: 'D-044',
    queueId: 'q-aadhaar',
    status: 'WAITING',
    issuedAt: makeIso(14),
  },
  'tok-006': {
    id: 'tok-006',
    displayNumber: 'D-045',
    queueId: 'q-aadhaar',
    status: 'WAITING',
    issuedAt: makeIso(18),
  },

  // ---- PAN queue ----
  'tok-007': {
    id: 'tok-007',
    displayNumber: 'P-011',
    queueId: 'q-pan',
    status: 'SERVING',
    issuedAt: makeIso(5),
    calledAt: makeRecentIso(105), // 01:45 ago
    counterId: 'ctr-02',
  },
  'tok-008': {
    id: 'tok-008',
    displayNumber: 'P-012',
    queueId: 'q-pan',
    status: 'WAITING',
    issuedAt: makeIso(8),
  },
  'tok-009': {
    id: 'tok-009',
    displayNumber: 'P-013',
    queueId: 'q-pan',
    status: 'WAITING',
    issuedAt: makeIso(16),
  },

  // ---- Income Certificate queue ----
  'tok-010': {
    id: 'tok-010',
    displayNumber: 'I-005',
    queueId: 'q-income',
    status: 'SERVING',
    issuedAt: makeIso(4),
    calledAt: makeRecentIso(260), // 04:20 ago
    counterId: 'ctr-03',
  },
  'tok-011': {
    id: 'tok-011',
    displayNumber: 'I-006',
    queueId: 'q-income',
    status: 'WAITING',
    issuedAt: makeIso(11),
  },
  'tok-012': {
    id: 'tok-012',
    displayNumber: 'I-007',
    queueId: 'q-income',
    status: 'WAITING',
    issuedAt: makeIso(19),
  },

  // ---- Domicile Certificate queue ----
  'tok-013': {
    id: 'tok-013',
    displayNumber: 'DC-003',
    queueId: 'q-domicile',
    status: 'SERVING',
    issuedAt: makeIso(6),
    calledAt: makeRecentIso(90), // 01:30 ago
    counterId: 'ctr-04',
  },
  'tok-014': {
    id: 'tok-014',
    displayNumber: 'DC-004',
    queueId: 'q-domicile',
    status: 'WAITING',
    issuedAt: makeIso(13),
  },

  // ---- Land Records queue ----
  'tok-015': {
    id: 'tok-015',
    displayNumber: 'L-008',
    queueId: 'q-land',
    status: 'SERVING',
    issuedAt: makeIso(7),
    calledAt: makeRecentIso(560), // 09:20 ago (over 480s benchmark)
    counterId: 'ctr-05',
  },
  'tok-016': {
    id: 'tok-016',
    displayNumber: 'L-009',
    queueId: 'q-land',
    status: 'WAITING',
    issuedAt: makeIso(15),
  },
  'tok-017': {
    id: 'tok-017',
    displayNumber: 'L-010',
    queueId: 'q-land',
    status: 'WAITING',
    issuedAt: makeIso(20),
  },
  'tok-018': {
    id: 'tok-018',
    displayNumber: 'L-011',
    queueId: 'q-land',
    status: 'WAITING',
    issuedAt: makeIso(22),
  },
};

/* ------------------------------------------------------------------ */
/*  QUEUES                                                            */
/* ------------------------------------------------------------------ */
export const SEED_QUEUES: Record<string, Queue> = {
  'q-aadhaar': {
    id: 'q-aadhaar',
    serviceId: 'svc-aadhaar',
    waitingTokenIds: ['tok-004', 'tok-005', 'tok-006'],
    recentHistory: [1, 2],
  },
  'q-pan': {
    id: 'q-pan',
    serviceId: 'svc-pan',
    waitingTokenIds: ['tok-008', 'tok-009'],
    recentHistory: [2, 2],
  },
  'q-income': {
    id: 'q-income',
    serviceId: 'svc-income',
    waitingTokenIds: ['tok-011', 'tok-012'],
    recentHistory: [1, 2],
  },
  'q-domicile': {
    id: 'q-domicile',
    serviceId: 'svc-domicile',
    waitingTokenIds: ['tok-014'],
    recentHistory: [3, 2],
  },
  'q-land': {
    id: 'q-land',
    serviceId: 'svc-land',
    waitingTokenIds: ['tok-016', 'tok-017', 'tok-018'],
    recentHistory: [1, 2],
  },
};

/* ------------------------------------------------------------------ */
/*  COUNTERS                                                          */
/* ------------------------------------------------------------------ */
export const SEED_COUNTERS: Record<string, Counter> = {
  'ctr-01': {
    id: 'ctr-01',
    label: 'Counter 01',
    serviceId: 'svc-aadhaar',
    queueId: 'q-aadhaar',
    status: 'ACTIVE',
    staffId: 'staff-01',
    currentTokenId: 'tok-003',
    servedToday: 2,
    avgServiceTimeSec: 290,
    utilizationRate: 82,
    servingStartedAt: STORE_BOOT_TIME - 45_000, // 45s ago
  },
  'ctr-02': {
    id: 'ctr-02',
    label: 'Counter 02',
    serviceId: 'svc-pan',
    queueId: 'q-pan',
    status: 'ACTIVE',
    staffId: 'staff-02',
    currentTokenId: 'tok-007',
    servedToday: 4,
    avgServiceTimeSec: 230,
    utilizationRate: 88,
    servingStartedAt: STORE_BOOT_TIME - 75_000, // 1m 15s ago
  },
  'ctr-03': {
    id: 'ctr-03',
    label: 'Counter 03',
    serviceId: 'svc-income',
    queueId: 'q-income',
    status: 'ACTIVE',
    staffId: 'staff-03',
    currentTokenId: 'tok-010',
    servedToday: 3,
    avgServiceTimeSec: 350,
    utilizationRate: 76,
    servingStartedAt: STORE_BOOT_TIME - 110_000, // 1m 50s ago
  },
  'ctr-04': {
    id: 'ctr-04',
    label: 'Counter 04',
    serviceId: 'svc-domicile',
    queueId: 'q-domicile',
    status: 'ACTIVE',
    staffId: 'staff-04',
    currentTokenId: 'tok-013',
    servedToday: 1,
    avgServiceTimeSec: 400,
    utilizationRate: 65,
    servingStartedAt: STORE_BOOT_TIME - 30_000, // 30s ago
  },
  'ctr-05': {
    id: 'ctr-05',
    label: 'Counter 05',
    serviceId: 'svc-land',
    queueId: 'q-land',
    status: 'ACTIVE',
    staffId: 'staff-05',
    currentTokenId: 'tok-015',
    servedToday: 5,
    avgServiceTimeSec: 460,
    utilizationRate: 92,
    servingStartedAt: STORE_BOOT_TIME - 140_000, // 2m 20s ago
  },
  'ctr-06': {
    id: 'ctr-06',
    label: 'Counter 06',
    serviceId: 'svc-aadhaar',
    queueId: 'q-aadhaar',
    status: 'PAUSED',
    staffId: 'staff-06',
    currentTokenId: null,
    servedToday: 0,
    avgServiceTimeSec: 0,
    utilizationRate: 0,
    servingStartedAt: null,
  },
};

/* ------------------------------------------------------------------ */
/*  STAFF                                                             */
/* ------------------------------------------------------------------ */
export const SEED_STAFF: Record<string, Staff> = {
  'staff-01': { id: 'staff-01', name: 'Aarav Sharma',   role: 'STAFF', counterId: 'ctr-01' },
  'staff-02': { id: 'staff-02', name: 'Priya Patel',    role: 'STAFF', counterId: 'ctr-02' },
  'staff-03': { id: 'staff-03', name: 'Rohan Gupta',    role: 'STAFF', counterId: 'ctr-03' },
  'staff-04': { id: 'staff-04', name: 'Sneha Verma',    role: 'STAFF', counterId: 'ctr-04' },
  'staff-05': { id: 'staff-05', name: 'Vikram Singh',   role: 'STAFF', counterId: 'ctr-05' },
  'staff-06': { id: 'staff-06', name: 'Ananya Reddy',   role: 'STAFF', counterId: 'ctr-06' },
  'admin-01': { id: 'admin-01', name: 'Deepak Mishra',  role: 'ADMIN', counterId: null },
};

/* ------------------------------------------------------------------ */
/*  ANALYTICS (historical / current-day)                              */
/* ------------------------------------------------------------------ */
export const SEED_ANALYTICS: AnalyticsSnapshot = {
  totalFootfallToday: 87,
  totalTokensIssued: 87,
  totalServedToday: 65,
  totalWaitingToday: 11,
  totalMissedToday: 6,
  avgWaitTimeSec: 385,
  avgServiceTimeSec: 321,
  peakHour: 11,
  hourlyFootfall: [
    0, 0, 0, 0, 0, 0, 0, 0,    // 00–07
    0, 12, 18, 22, 14, 8, 6, 4, // 08–15 (09:00 - 16:00)
    3, 0, 0, 0, 0, 0, 0, 0,    // 16–23 (16:00 - 17:00 is 3)
  ],
  hourlyAvgWaitSec: [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 300, 480, 600, 540, 360, 300, 240,
    180, 0, 0, 0, 0, 0, 0, 0,
  ],
  operatingHours: [
    { hour: 9,  label: '09:00', footfall: 12, avgWaitSec: 300 },
    { hour: 10, label: '10:00', footfall: 18, avgWaitSec: 480 },
    { hour: 11, label: '11:00', footfall: 22, avgWaitSec: 600 },
    { hour: 12, label: '12:00', footfall: 14, avgWaitSec: 540 },
    { hour: 13, label: '13:00', footfall: 8,  avgWaitSec: 360 },
    { hour: 14, label: '14:00', footfall: 6,  avgWaitSec: 300 },
    { hour: 15, label: '15:00', footfall: 4,  avgWaitSec: 240 },
    { hour: 16, label: '16:00', footfall: 3,  avgWaitSec: 180 },
  ],
  servicePerformance: {
    'svc-aadhaar': {
      serviceId: 'svc-aadhaar',
      serviceName: 'Aadhaar Update',
      tokensGenerated: 30,
      customersServed: 24,
      currentlyWaiting: 3,
      avgWaitTimeSec: 380,
      avgServiceTimeSec: 295,
      missedTokens: 2,
    },
    'svc-pan': {
      serviceId: 'svc-pan',
      serviceName: 'PAN Card',
      tokensGenerated: 21,
      customersServed: 17,
      currentlyWaiting: 2,
      avgWaitTimeSec: 290,
      avgServiceTimeSec: 235,
      missedTokens: 1,
    },
    'svc-income': {
      serviceId: 'svc-income',
      serviceName: 'Income Certificate',
      tokensGenerated: 14,
      customersServed: 10,
      currentlyWaiting: 2,
      avgWaitTimeSec: 420,
      avgServiceTimeSec: 355,
      missedTokens: 1,
    },
    'svc-domicile': {
      serviceId: 'svc-domicile',
      serviceName: 'Domicile Certificate',
      tokensGenerated: 8,
      customersServed: 6,
      currentlyWaiting: 1,
      avgWaitTimeSec: 360,
      avgServiceTimeSec: 410,
      missedTokens: 0,
    },
    'svc-land': {
      serviceId: 'svc-land',
      serviceName: 'Land Records',
      tokensGenerated: 14,
      customersServed: 8,
      currentlyWaiting: 3,
      avgWaitTimeSec: 580,
      avgServiceTimeSec: 475,
      missedTokens: 2,
    },
  },
};

/* ------------------------------------------------------------------ */
/*  PREDICTIONS (future-looking)                                      */
/* ------------------------------------------------------------------ */
export const SEED_PREDICTIONS: PredictionSnapshot = {
  predictedFootfallToday: 110,
  predictedHourlyFootfall: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 14, 20, 25, 18, 12, 9, 5,
    2, 0, 0, 0, 0, 0, 0, 0,
  ],
  predictedAvgWaitSec: [
    0, 0, 0, 0, 0, 0, 0, 0,
    200, 340, 520, 660, 580, 400, 320, 260,
    180, 0, 0, 0, 0, 0, 0, 0,
  ],
  predictedQueueLoad: {
    'svc-aadhaar': 5,
    'svc-pan': 3,
    'svc-income': 4,
    'svc-domicile': 2,
    'svc-land': 6,
  },
};
