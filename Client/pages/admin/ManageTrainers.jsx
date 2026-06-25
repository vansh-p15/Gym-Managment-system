import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rateSaving, setRateSaving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '', dailyRate: '' });
  const [rateDrafts, setRateDrafts] = useState({});
  const [error, setError] = useState('');

  const fetchTrainers = async () => {
    try {
      const data = await api.get('/admin/trainers');
      setTrainers(data);

      const nextDrafts = {};
      data.forEach((trainer) => {
        nextDrafts[trainer._id] = trainer.dailyRate || 0;
      });
      setRateDrafts(nextDrafts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admin/trainers', {
        ...form,
        dailyRate: Number(form.dailyRate) || 0,
      });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', specialization: '', dailyRate: '' });
      fetchTrainers();
    } catch (err) {
      setError(err.message || 'Failed to add trainer');
    } finally {
      setSaving(false);
    }
  };

  const handleRateSave = async (trainerId) => {
    const rateValue = Number(rateDrafts[trainerId]);
    if (Number.isNaN(rateValue) || rateValue < 0) {
      alert('Please enter a valid daily rate (0 or more).');
      return;
    }

    setRateSaving(trainerId);
    try {
      await api.put(`/admin/trainers/${trainerId}`, { dailyRate: rateValue });
      fetchTrainers();
    } catch (err) {
      alert(err.message || 'Failed to update daily rate');
    } finally {
      setRateSaving(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;

    setDeleting(id);
    try {
      await api.delete(`/admin/trainers/${id}`);
      fetchTrainers();
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
          <i className="bi bi-person-badge me-2 text-danger"></i>Manage Trainers
        </h3>
        <button className="btn btn-danger" onClick={() => { setShowModal(true); setError(''); }}>
          <i className="bi bi-plus-circle me-1"></i>Add Trainer
        </button>
      </div>

      <div className="row">
        {trainers.map((t) => (
          <div className="col-md-6 col-lg-4 mb-3" key={t._id}>
            <div className="card shadow-sm h-100">
              <div className="card-body text-center">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '70px', height: '70px' }}>
                  <i className="bi bi-person-fill display-6 text-danger"></i>
                </div>
                <h5 className="fw-bold">{t.name}</h5>
                <p className="text-muted mb-1">{t.email}</p>
                <p className="mb-1"><i className="bi bi-phone me-1"></i>{t.phone || 'N/A'}</p>
                <span className="badge bg-info mb-2">{t.specialization || 'General'}</span>
                <p className="fw-semibold mb-1">Daily Rate: <span className="text-success">Rs {Number(t.dailyRate || 0).toLocaleString()}</span></p>
                <hr />
                <div className="d-flex justify-content-around">
                  <div className="text-center">
                    <h5 className="text-danger fw-bold mb-0">{t.assignedMembers}</h5>
                    <small className="text-muted">Members</small>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent text-center">
                <div className="input-group input-group-sm mb-2">
                  <span className="input-group-text">Rs/day</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={rateDrafts[t._id] ?? 0}
                    onChange={(e) => setRateDrafts({ ...rateDrafts, [t._id]: e.target.value })}
                  />
                  <button className="btn btn-outline-success" onClick={() => handleRateSave(t._id)} disabled={rateSaving === t._id}>
                    {rateSaving === t._id ? 'Saving...' : 'Save Rate'}
                  </button>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t._id)} disabled={deleting === t._id}>
                  {deleting === t._id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Removing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i>Remove
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
                <h5 className="modal-title">Add Trainer</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger mb-3">{error}</div>}
                  {['name', 'email', 'password', 'phone', 'specialization', 'dailyRate'].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize fw-semibold">{field}</label>
                      <input
                        type={field === 'password' ? 'password' : field === 'dailyRate' ? 'number' : 'text'}
                        min={field === 'dailyRate' ? '0' : undefined}
                        className="form-control"
                        value={form[field]}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                  ))}
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
                        <i className="bi bi-check-lg me-1"></i>Add Trainer
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

export default ManageTrainers;
