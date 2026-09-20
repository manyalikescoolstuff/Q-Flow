import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/common/AppHeader';
import { useQFlowStore } from '@/mock/store';
import './StaffLayout.css';

/**
 * Layout wrapper for the Staff dashboard.
 *
 * For the prototype we hard-code staff-01 (Counter 01).
 * A real implementation would resolve the current user from auth context.
 */
export const CURRENT_STAFF_ID = 'staff-01';

export function StaffLayout() {
  const staff = useQFlowStore((s) => s.staff[CURRENT_STAFF_ID]);
  const counter = useQFlowStore((s) =>
    staff?.counterId ? s.counters[staff.counterId] : undefined,
  );
  const service = useQFlowStore((s) =>
    counter ? s.services[counter.serviceId] : undefined,
  );

  const contextLabel = counter && service
    ? `${counter.label} · ${service.name}`
    : 'Staff';

  return (
    <div className="staff-layout">
      <AppHeader contextLabel={contextLabel} />
      {counter && (
        <div className="staff-layout__status-bar">
          <span
            className={`status-badge status-badge--${counter.status.toLowerCase()}`}
          >
            <span className={`status-dot status-dot--${counter.status.toLowerCase()}`} />
            {counter.status}
          </span>
        </div>
      )}
      <main className="staff-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
