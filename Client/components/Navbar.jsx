import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3">
      {user && (
        <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => navigate(`/${user.role}/dashboard`)} title="Go to Dashboard">
          <i className="bi bi-arrow-left"></i>
        </button>
      )}
      <Link className="navbar-brand fw-bold" to="/">
        <i className="bi bi-heart-pulse-fill text-danger me-2"></i>
        FitSphere
      </Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto align-items-center">
          {user ? (
            <>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm d-flex align-items-center" onClick={() => navigate(`/${user.role}/dashboard`)}>
                  <i className="bi bi-person-circle me-1"></i>
                  {user.name}
                  <span className="badge bg-danger ms-2 text-capitalize">{user.role}</span>
                </button>
              </li>
              <li className="nav-item">
                <button className="btn btn-outline-light btn-sm ms-2" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login" state={{ from: location.pathname }}>Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-danger btn-sm ms-2" to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
