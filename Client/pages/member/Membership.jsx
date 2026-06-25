import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Membership = () => {
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get('/member/membership'), api.get('/plans')])
      .then(([m, p]) => { setMemberships(m); setPlans(p); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const activeMembership = memberships.find(m => m.status === 'active');
  const currentPlanName = activeMembership?.plan?.name;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-card-checklist me-2 text-danger"></i>Membership Details
      </h3>

      {activeMembership ? (
        <div className="card shadow-sm border-danger mb-4">
          <div className="card-header bg-danger text-white fw-semibold">
            <i className="bi bi-star-fill me-2"></i>Your Current Plan
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-4 text-center">
                <h2 className="text-danger fw-bold">{activeMembership.plan?.name}</h2>
                <h3 className="fw-bold">₹{activeMembership.plan?.price}</h3>
                <p className="text-muted">{activeMembership.plan?.duration} month(s)</p>
              </div>
              <div className="col-md-4">
                <h6 className="fw-semibold mb-2">Features:</h6>
                <ul className="list-unstyled">
                  {activeMembership.plan?.features?.map((f, i) => (
                    <li key={i} className="mb-1"><i className="bi bi-check-circle-fill text-success me-2"></i>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="col-md-4 text-center">
                <div className="mb-2"><small className="text-muted">Start Date</small><p className="fw-semibold mb-0">{new Date(activeMembership.startDate).toLocaleDateString()}</p></div>
                <div className="mb-2"><small className="text-muted">Expiry Date</small><p className="fw-semibold mb-0 text-warning">{new Date(activeMembership.endDate).toLocaleDateString()}</p></div>
                <div><small className="text-muted">Status</small><p><span className="badge bg-success fs-6">{activeMembership.status}</span></p></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-4"><i className="bi bi-exclamation-triangle me-2"></i>No active membership. Contact admin to get a plan.</div>
      )}

      <h5 className="fw-semibold mb-3">Available Plans</h5>
      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-6 col-lg-3 mb-3" key={plan._id}>
            <div className={`card shadow-sm h-100 ${plan.name === currentPlanName ? 'border-danger' : ''}`}>
              <div className={`card-header text-center fw-bold ${plan.name === currentPlanName ? 'bg-danger text-white' : 'bg-light'}`}>
                {plan.name}
                {plan.name === currentPlanName && <span className="badge bg-white text-danger ms-2">Current</span>}
              </div>
              <div className="card-body text-center">
                <h3 className="fw-bold text-danger">₹{plan.price}</h3>
                <p className="text-muted">{plan.duration} month(s)</p>
                <hr />
                <ul className="list-unstyled text-start">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="mb-1 small"><i className="bi bi-check text-success me-1"></i>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="card-footer text-center bg-transparent">
                <button
                  className={`btn w-100 ${plan.name === currentPlanName ? 'btn-outline-danger disabled' : 'btn-danger'}`}
                  onClick={() => {
                    if (plan.name === currentPlanName) return;
                    navigate('/member/payment', { state: { planId: plan._id } });
                  }}
                >
                  {plan.name === currentPlanName ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membership;
