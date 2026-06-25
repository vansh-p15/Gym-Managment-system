import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { validateField, validateSignupForm } from '../utils/validation';

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError('');
    const validation = validateField(name, value, { ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: validation.isValid ? '' : validation.message }));
    if (name === 'password') setPasswordStrength(validation.strength || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');

    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const user = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'member',
      });
      const fromState = location.state?.from;
      const candidatePath = typeof fromState === 'string'
        ? fromState
        : `${fromState?.pathname || ''}${fromState?.search || ''}${fromState?.hash || ''}`;
      const blockedPaths = ['/login', '/signup', ''];
      const targetPath = blockedPaths.includes(candidatePath) ? `/${user.role}/dashboard` : candidatePath;
      navigate(targetPath, { replace: true });
    } catch (err) {
      setApiError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'success';
      case 'medium': return 'warning';
      case 'weak': return 'danger';
      default: return 'secondary';
    }
  };

  const isFormValid = () => validateSignupForm(formData).isValid;

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="position-absolute top-0 start-0 m-3">
        <Link to="/" className="btn btn-outline-light btn-sm">
          <i className="bi bi-arrow-left me-1"></i>Back to Home
        </Link>
      </div>
      <div className="card bg-dark text-white border border-secondary shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <i className="bi bi-heart-pulse-fill text-danger fs-1"></i>
              <h2 className="mt-2 fw-bold text-white">FitSphere</h2>
            </Link>
            <p className="text-secondary">Create your account</p>
          </div>

          {apiError && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>{apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className={`form-control bg-dark text-white border-secondary ${errors.name ? 'is-invalid' : formData.name && !errors.name ? 'is-valid' : ''}`}
                value={formData.name}
                onChange={handleChange}
                required
                maxLength="50"
                placeholder="Enter your full name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              <small className="text-muted">{formData.name.length}/50 characters</small>
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
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-control bg-dark text-white border-secondary"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
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
                  placeholder="Create a strong password"
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
              {formData.password && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <small>Strength:</small>
                    <span className={`badge bg-${getStrengthColor()}`}>{passwordStrength || 'weak'}</span>
                  </div>
                  <div className="progress mt-1" style={{ height: '4px' }}>
                    <div
                      className={`progress-bar bg-${getStrengthColor()}`}
                      style={{ width: passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%' }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`form-control bg-dark text-white border-secondary ${errors.confirmPassword ? 'is-invalid' : formData.confirmPassword && !errors.confirmPassword ? 'is-valid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-danger w-100 fw-semibold" disabled={!isFormValid() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="mb-0">Already have an account? <Link to="/login" state={{ from: location.state?.from || '/' }} className="text-danger">Log In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
