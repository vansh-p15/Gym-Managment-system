import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="bg-dark text-white py-5">
        <div className="container">
          <div className="row align-items-center py-5">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold">
                Transform Your Body at
                <span className="text-danger"> FitSphere</span>
              </h1>
              <p className="lead text-secondary mt-3">
                Your ultimate gym management destination. World-class trainers, modern equipment,
                and personalized workout plans to help you achieve your fitness goals.
              </p>
              
            </div>
            <div className="col-lg-6 text-center">
              <div className="bg-danger bg-opacity-10 rounded-4 p-5">
                <i className="bi bi-heart-pulse-fill display-1 text-danger"></i>
                <div className="row mt-4 g-3">
                  {[
                    { icon: 'bi-trophy', value: '500+', label: 'Members' },
                    { icon: 'bi-person-badge', value: '15+', label: 'Trainers' },
                    { icon: 'bi-clock', value: '5AM-11PM', label: 'Open Hours' },
                    { icon: 'bi-geo-alt', value: '3', label: 'Branches' },
                  ].map((stat, idx) => (
                    <div className="col-6" key={idx}>
                      <div className="bg-dark rounded-3 p-3">
                        <i className={`bi ${stat.icon} fs-4 text-danger`}></i>
                        <h4 className="fw-bold mb-0 mt-1">{stat.value}</h4>
                        <small className="text-secondary">{stat.label}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Why Choose <span className="text-danger">FitSphere</span>?</h2>
            <p className="text-muted">Everything you need for your fitness journey</p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'bi-buildings', title: 'Modern Equipment', desc: 'State-of-the-art gym equipment from top brands for every workout style.' },
              { icon: 'bi-person-video3', title: 'Expert Trainers', desc: 'Certified personal trainers to guide and motivate you throughout your journey.' },
              { icon: 'bi-clipboard2-pulse', title: 'Custom Workout Plans', desc: 'Personalized workout plans designed by experts based on your fitness goals.' },
              { icon: 'bi-check2-circle', title: 'Easy Check-In', desc: 'Quick manual check-in system for seamless gym entry and attendance tracking.' },
              { icon: 'bi-graph-up-arrow', title: 'Progress Tracking', desc: 'Monitor your fitness progress with detailed tracking and charts.' },
            ].map((feature, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="card border-0 shadow-sm h-100 text-center p-4">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '70px', height: '70px' }}>
                    <i className={`bi ${feature.icon} fs-2 text-danger`}></i>
                  </div>
                  <h5 className="fw-bold">{feature.title}</h5>
                  <p className="text-muted mb-0">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Facilities */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Our <span className="text-danger">Facilities</span></h2>
            <p className="text-muted">Everything under one roof</p>
          </div>
          <div className="row g-3">
            {[
              { icon: 'bi-bicycle', name: 'Cardio Zone' },
              { icon: 'bi-award', name: 'Weight Training' },
              { icon: 'bi-flower1', name: 'Yoga Studio' },
              { icon: 'bi-droplet', name: 'Steam & Sauna' },
              { icon: 'bi-cup-hot', name: 'Protein Bar' },
              { icon: 'bi-lock', name: 'Locker Rooms' },
              { icon: 'bi-car-front', name: 'Free Parking' },
              { icon: 'bi-wifi', name: 'Free Wi-Fi' },
            ].map((facility, idx) => (
              <div className="col-6 col-md-3" key={idx}>
                <div className="card border-0 shadow-sm text-center p-3 h-100">
                  <i className={`bi ${facility.icon} fs-2 text-danger`}></i>
                  <p className="fw-semibold mb-0 mt-2">{facility.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">What Our <span className="text-danger">Members</span> Say</h2>
          </div>
          <div className="row g-4">
            {[
              { name: 'Rahul Sharma', text: 'FitSphere completely changed my fitness journey. The trainers are amazing and the equipment is top-notch!', rating: 5 },
              { name: 'Priya Singh', text: 'Love the personalized workout plans. I have seen incredible results in just 3 months.', rating: 5 },
              { name: 'Vikram Joshi', text: 'The check-in system is so convenient. Great gym with a fantastic community atmosphere!', rating: 4 },
            ].map((testimonial, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card border-0 shadow-sm h-100 p-4">
                  <div className="mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="bi bi-star-fill text-warning me-1"></i>
                    ))}
                  </div>
                  <p className="text-muted fst-italic">"{testimonial.text}"</p>
                  <div className="d-flex align-items-center mt-auto">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-person text-danger"></i>
                    </div>
                    <strong>{testimonial.name}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-danger text-white">
        <div className="container text-center">
          <h2 className="fw-bold mb-3">Ready to Start Your Fitness Journey?</h2>
          <p className="lead mb-4">Join FitSphere today and transform your body and mind!</p>
          <Link to="/signup" className="btn btn-light btn-lg px-5 fw-bold text-danger">
            <i className="bi bi-rocket-takeoff me-2"></i>Join Now — It's Easy!
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
