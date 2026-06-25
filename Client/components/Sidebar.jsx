import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const memberLinks = [
    { to: '/member/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/member/profile', icon: 'bi-person', label: 'Profile' },
    { to: '/member/membership', icon: 'bi-card-checklist', label: 'Membership' },
    { to: '/member/workout', icon: 'bi-activity', label: 'Workout Plan' },
    { to: '/member/attendance', icon: 'bi-calendar-check', label: 'Attendance' },
    { to: '/member/payment', icon: 'bi-credit-card', label: 'Payment' },
    { to: '/member/payments', icon: 'bi-receipt', label: 'Payment History' },
  ];

  const trainerLinks = [
    { to: '/trainer/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/trainer/attendance', icon: 'bi-calendar2-check', label: 'Attendance' },
    { to: '/trainer/members', icon: 'bi-people', label: 'Assigned Members' },
    { to: '/trainer/workout-upload', icon: 'bi-upload', label: 'Upload Workout' },
    { to: '/trainer/progress', icon: 'bi-graph-up', label: 'Update Progress' },
    { to: '/trainer/schedule', icon: 'bi-calendar-week', label: 'Schedule' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/members', icon: 'bi-people', label: 'Manage Members' },
    { to: '/admin/trainers', icon: 'bi-person-badge', label: 'Manage Trainers' },
    { to: '/admin/plans', icon: 'bi-tags', label: 'Membership Plans' },
    { to: '/admin/payments', icon: 'bi-cash-stack', label: 'Payments' },
    { to: '/admin/trainer-payments', icon: 'bi-wallet2', label: 'Trainer Payments' },
    { to: '/admin/attendance', icon: 'bi-calendar-check', label: 'Attendance' },
    { to: '/admin/reports', icon: 'bi-file-earmark-bar-graph', label: 'Reports' },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'trainer' ? trainerLinks : memberLinks;

  return (
    <div className="d-flex flex-column bg-dark text-white p-3" style={{ width: '240px', minHeight: 'calc(100vh - 56px)' }}>
      <div className="text-center mb-3">
        <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <i className="bi bi-person-fill fs-4"></i>
        </div>
        <p className="mt-2 mb-0 fw-semibold">{user.name}</p>
        <small className="text-secondary text-capitalize">{user.role}</small>
      </div>
      <hr className="border-secondary" />
      <nav className="nav flex-column gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link rounded px-3 py-2 ${isActive ? 'bg-danger text-white' : 'text-white-50'}`
            }
          >
            <i className={`bi ${link.icon} me-2`}></i>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
