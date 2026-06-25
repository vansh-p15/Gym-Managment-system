import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', price: '', duration: '', features: '' });

  const fetchPlans = () => {
    api.get('/admin/plans').then(setPlans).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price) {
      setError('Name and price are required');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/plans', {
        name: form.name,
        price: Number(form.price),
        duration: Number(form.duration) || 1,
        features: form.features.split(',').map(f => f.trim()).filter(Boolean),
      });
      setShowModal(false);
      setForm({ name: '', price: '', duration: '', features: '' });
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Failed to add plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-tags me-2 text-danger"></i>Membership Plans
        </h3>
        <button className="btn btn-danger" onClick={() => { setShowModal(true); setError(''); }}>
          <i className="bi bi-plus-circle me-1"></i>Add Plan
        </button>
      </div>

      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-6 col-lg-3 mb-3" key={plan._id}>
            <div className="card shadow-sm h-100">
              <div className="card-header bg-danger text-white text-center fw-bold">
                {plan.name}
              </div>
              <div className="card-body text-center">
                <h2 className="fw-bold text-danger">₹{plan.price}</h2>
                <p className="text-muted">{plan.duration} {plan.duration === 1 ? 'Month' : 'Months'}</p>
                <hr />
                <ul className="list-unstyled text-start">
                  {(plan.features || []).map((f, i) => (
                    <li key={i} className="mb-1 small">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer bg-transparent text-center">
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(plan._id)} disabled={deleting === plan._id}>
                  {deleting === plan._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i>Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Add Membership Plan</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger mb-3">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Plan Name</label>
                    <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={saving} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Price (₹)</label>
                    <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} disabled={saving} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Duration (months)</label>
                    <input type="number" className="form-control" placeholder="e.g., 3" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} disabled={saving} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Features (comma-separated)</label>
                    <textarea className="form-control" rows="3" placeholder="Gym Access, Locker Room, Personal Trainer" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} disabled={saving}></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn btn-danger" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>Add Plan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
