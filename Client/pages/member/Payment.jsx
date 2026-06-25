import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../AuthContext';

const Payment = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const fetchedPlans = await api.get('/plans');
        setPlans(fetchedPlans);
        const planId = location.state?.planId;
        if (planId) {
          const plan = fetchedPlans.find((p) => p._id === planId);
          if (plan) setSelectedPlan(plan);
        }
      } catch (err) {
        setError('Failed to load plans. Please refresh the page.');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [location.state?.planId]);

  const handlePayment = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create order on backend
      const orderData = await api.post('/payment/create-order', {
        planId: selectedPlan._id,
      });

      // Get Razorpay key from backend (always fetch from backend, never fallback)
      let keyId;
      try {
        const keyResponse = await api.get('/payment/key');
        keyId = keyResponse?.keyId;
      } catch (keyError) {
        throw new Error('Unable to load payment gateway. Please try again.');
      }

      if (!keyId) {
        throw new Error('Payment gateway not configured. Contact admin.');
      }

      // Ensure Razorpay library is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway library failed to load. Please refresh and try again.');
      }

      // Configure Razorpay checkout
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FitSphere Gym',
        description: `${orderData.planName} - ${orderData.planDuration} month(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#dc3545',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },config: {
          display: {
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response) => {
          try {
            const verifyData = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderData.paymentId,
            });

            alert(`Payment successful! Your ${orderData.planName} membership is now active until ${new Date(verifyData.membership.endDate).toLocaleDateString()}`);
            navigate('/member/membership');
          } catch (verifyError) {
            setError(verifyError.message || 'Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setError('Payment cancelled. Please try again.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setProcessing(false);
        setError(`Payment failed: ${response.error.description}`);
      });
      razorpay.open();
    } catch (err) {
      setProcessing(false);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      console.error('Payment error:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-credit-card me-2 text-danger"></i>Membership Payment
      </h3>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-6 col-lg-3 mb-3" key={plan._id}>
            <div
              className={`card shadow-sm h-100 ${selectedPlan?._id === plan._id ? 'border-danger border-2' : ''}`}
              style={{ cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.7 : 1 }}
              onClick={() => !processing && setSelectedPlan(plan)}
            >
              <div className={`card-header text-center fw-bold ${selectedPlan?._id === plan._id ? 'bg-danger text-white' : 'bg-light'}`}>
                {selectedPlan?._id === plan._id && <i className="bi bi-check-circle me-1"></i>}
                {plan.name}
              </div>
              <div className="card-body text-center">
                <h3 className="fw-bold text-danger">₹{plan.price}</h3>
                <p className="text-muted">{plan.duration} month(s)</p>
                <hr />
                <ul className="list-unstyled text-start small">
                  {plan.features?.map((f, i) => (
                    <li key={i} className="mb-1">
                      <i className="bi bi-check text-success me-1"></i>{f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="fw-bold">Order Summary</h5>
                <p className="mb-1">Plan: <strong>{selectedPlan.name}</strong></p>
                <p className="mb-1">Duration: <strong>{selectedPlan.duration} month(s)</strong></p>
                <p className="mb-0">Amount: <strong className="text-danger fs-5">₹{selectedPlan.price}</strong></p>
              </div>
              <div className="col-md-4 text-end">
                <button
                  className="btn btn-danger btn-lg w-100"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-lock me-2"></i>Pay Now
                    </>
                  )}
                </button>
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-lock me-1"></i>Secured by Razorpay
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
