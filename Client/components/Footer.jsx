import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <div className="container">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-lg-4 mb-3">
            <h4 className="fw-bold">
              <i className="bi bi-heart-pulse-fill text-danger me-2"></i>FitSphere
            </h4>
            <p className="text-secondary">
              Your complete gym management solution. Achieve your fitness goals with world-class trainers,
              modern equipment, and personalized plans.
            </p>
            <div className="d-flex gap-3">
              <span className="btn btn-outline-danger btn-sm rounded-circle">
                <i className="bi bi-facebook"></i>
              </span>
              <span className="btn btn-outline-danger btn-sm rounded-circle">
                <i className="bi bi-instagram"></i>
              </span>
              <span className="btn btn-outline-danger btn-sm rounded-circle">
                <i className="bi bi-twitter-x"></i>
              </span>
              <span className="btn btn-outline-danger btn-sm rounded-circle">
                <i className="bi bi-youtube"></i>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-4 mb-3">
            <h6 className="fw-bold text-danger mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/login" state={{ from: location.pathname }} className="text-secondary text-decoration-none">Login</Link></li>
              <li className="mb-2"><Link to="/signup" className="text-secondary text-decoration-none">Sign Up</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-lg-3 col-md-4 mb-3">
            <h6 className="fw-bold text-danger mb-3">Services</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-secondary">Personal Training</li>
              <li className="mb-2 text-secondary">Group Classes</li>
              <li className="mb-2 text-secondary">Fitness Assessment</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-3 col-md-4 mb-3">
            <h6 className="fw-bold text-danger mb-3">Contact Us</h6>
            <ul className="list-unstyled">
              <li className="mb-2 text-secondary">
                <i className="bi bi-geo-alt me-2 text-danger"></i>123 Fitness Street, Mumbai
              </li>
              <li className="mb-2 text-secondary">
                <i className="bi bi-telephone me-2 text-danger"></i>+91 98765 43210
              </li>
              <li className="mb-2 text-secondary">
                <i className="bi bi-envelope me-2 text-danger"></i>info@fitsphere.com
              </li>
              <li className="mb-2 text-secondary">
                <i className="bi bi-clock me-2 text-danger"></i>Mon-Sat: 5AM - 11PM
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="text-secondary">
              &copy; {new Date().getFullYear()} FitSphere. All rights reserved.
            </small>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <small className="text-secondary">
              Made with <i className="bi bi-heart-fill text-danger"></i> for fitness enthusiasts
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
