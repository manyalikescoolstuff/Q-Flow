import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/common/AppHeader';
import { AdminSidebar } from '@/components/common/AdminSidebar';
import './AdminLayout.css';

/**
 * Layout wrapper for the Admin dashboard.
 * Header on top, sidebar on the left, content area on the right.
 */
export function AdminLayout() {
  return (
    <div className="admin-layout">
      <AppHeader contextLabel="Administrator" />
      <div className="admin-layout__body">
        <AdminSidebar />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
