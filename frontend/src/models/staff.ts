/**
 * A staff member who operates a counter.
 */
export type StaffRole = 'STAFF' | 'ADMIN';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  /** Counter this staff member is assigned to (null for admins) */
  counterId: string | null;
}
