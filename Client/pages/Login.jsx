import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { validateField, validateLoginForm } from '../utils/validation';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false, role: 'member' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setApiError('');

    if (name !== 'rememberMe' && name !== 'role') {
      const validation = validateField(name, newValue);
      setErrors((prev) => ({ ...prev, [name]: validation.isValid ? '' : validation.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const user = await login(formData.email, formData.password, formData.role);
      const fromState = location.state?.from;
      const candidatePath = typeof fromState === 'string'
        ? fromState
        : `${fromState?.pathname || ''}${fromState?.search || ''}${fromState?.hash || ''}`;
      const blockedPaths = ['/login', '/signup', ''];
      const targetPath = blockedPaths.includes(candidatePath) ? `/${user.role}/dashboard` : candidatePath;
      navigate(targetPath, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => validateLoginForm(formData).isValid;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="position-absolute top-0 start-0 m-3">
        <Link to="/" className="btn btn-outline-light btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Back to Home
        </Link>
      </div>
      <div className="card bg-dark text-white border border-secondary shadow-lg" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-heart-pulse-fill text-danger fs-1"></i>
              <h2 className="mt-2 fw-bold text-white">FitSphere</h2>
            </Link>
            <p className="text-secondary">Log in to your account</p>
          </div>

          {apiError && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>{apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Login as</label>
              <div className="btn-group w-100" role="group" aria-label="Role selector">
                {['admin', 'trainer', 'member'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`btn ${formData.role === role ? 'btn-danger' : 'btn-outline-secondary'} text-capitalize`}
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-control bg-dark text-white border-secondary ${errors.email ? 'is-invalid' : formData.email && !errors.email ? 'is-valid' : ''}`}
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control bg-dark text-white border-secondary ${errors.password ? 'is-invalid' : formData.password && !errors.password ? 'is-valid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                name="rememberMe"
                className="form-check-input"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label className="form-check-label">Remember Me</label>
            </div>

            <button
              type="submit"
              className="btn btn-danger w-100 fw-semibold"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="mb-0">Don't have an account? <Link to="/signup" state={{ from: location.state?.from || '/' }} className="text-danger">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
