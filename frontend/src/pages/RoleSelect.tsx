import { useNavigate } from 'react-router-dom';
import './RoleSelect.css';

/**
 * Development/demo role selector.
 * This is NOT real authentication – it simply routes the user
 * to the Staff or Admin dashboard.
 */
export function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="role-select">
      <div className="role-select__heading">
        <h1 className="role-select__title">
          Q<span className="role-select__title-accent">-FLOW</span>
        </h1>
        <p className="role-select__subtitle">
          Smart Queue Management System
        </p>
      </div>

      <p className="text-secondary">Enter as:</p>

      <div className="role-select__options">
        <button
          className="role-select__card"
          onClick={() => navigate('/staff')}
        >
          <span className="role-select__card-icon">⊞</span>
          Staff
          <span className="role-select__card-desc">
            Operate your assigned counter and manage your queue
          </span>
        </button>

        <button
          className="role-select__card"
          onClick={() => navigate('/admin')}
        >
          <span className="role-select__card-icon">◈</span>
          Admin
          <span className="role-select__card-desc">
            Monitor the entire service centre in real time
          </span>
        </button>
      </div>
    </div>
  );
}
