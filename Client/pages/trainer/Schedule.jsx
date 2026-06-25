import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Schedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', startTime: '', endTime: '', activity: '' });
  const [saving, setSaving] = useState(false);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchSchedule = () => {
    api.get('/trainer/schedule').then(setSchedule).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchedule(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/trainer/schedule', form);
      setForm({ day: 'Monday', startTime: '', endTime: '', activity: '' });
      setShowForm(false);
      fetchSchedule();
    } catch (err) {
      alert(err.message || 'Failed to add schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-calendar-week me-2 text-danger"></i>Training Schedule
        </h3>
        <button className="btn btn-danger" onClick={() => setShowForm(!showForm)}>
          <i className="bi bi-plus-circle me-1"></i>{showForm ? 'Cancel' : 'Add Session'}
        </button>
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleAdd} className="row g-3 align-items-end">
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Day</label>
                <select className="form-select" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Activity</label>
                <input type="text" className="form-control" placeholder="e.g., HIIT Training" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">Start Time</label>
                <input type="time" className="form-control" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-semibold">End Time</label>
                <input type="time" className="form-control" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
              </div>
              <div className="col-md-3">
                <button type="submit" className="btn btn-danger w-100" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {days.map((day) => {
          const daySessions = schedule.filter((s) => s.day === day);
          return (
            <div className="col-md-6 col-lg-4 mb-3" key={day}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-danger text-white fw-semibold">
                  <i className="bi bi-calendar-day me-2"></i>{day}
                </div>
                <div className="card-body">
                  {daySessions.length > 0 ? (
                    daySessions.map((s) => (
                      <div key={s._id} className="border rounded p-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="small">{s.activity}</strong>
                          <span className="badge bg-info">{s.members?.length || 0}</span>
                        </div>
                        <small className="text-muted"><i className="bi bi-clock me-1"></i>{s.startTime} - {s.endTime}</small>
                        <div className="mt-1">
                          {(s.members || []).map((m, i) => (
                            <span key={i} className="badge bg-light text-dark me-1 small">{m.name || m}</span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center mb-0 small">No sessions</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Schedule;
