import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Progress = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [progressInfo, setProgressInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/trainer/members').then(setMembers).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedMember) { setProgressInfo(null); return; }
    setLoading(true);
    api.get(`/trainer/member/${selectedMember}/progress`)
      .then(setProgressInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMember]);

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-graph-up me-2 text-danger"></i>Update Member Progress
      </h3>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-danger text-white fw-semibold">
              <i className="bi bi-pencil-square me-2"></i>Member Progress
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Member</label>
                <select className="form-select" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                  <option value="">Choose a member...</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {loading && <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>}

              {progressInfo && !loading && (
                <>
                  <h6 className="fw-bold mt-4">Member Details</h6>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <div className="border rounded p-3 text-center">
                        <h6 className="text-muted small">Weight</h6>
                        <h4 className="fw-bold text-danger">{progressInfo.member?.weight || 'N/A'} kg</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded p-3 text-center">
                        <h6 className="text-muted small">Height</h6>
                        <h4 className="fw-bold text-info">{progressInfo.member?.height || 'N/A'} cm</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded p-3 text-center">
                        <h6 className="text-muted small">Age</h6>
                        <h4 className="fw-bold text-success">{progressInfo.member?.age || 'N/A'}</h4>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mt-4">Workout Plans ({progressInfo.workouts?.length || 0})</h6>
                  {(progressInfo.workouts || []).map((w) => (
                    <div key={w._id} className="border rounded p-2 mb-2">
                      <strong className="small">{w.day}</strong>
                      <div className="mt-1">
                        {(w.exercises || []).map((ex, i) => (
                          <span key={i} className="badge bg-light text-dark me-1 mb-1">{ex.name} ({ex.sets}x{ex.reps})</span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <h6 className="fw-bold mt-4">Recent Attendance ({progressInfo.attendance?.length || 0} records)</h6>
                  {(progressInfo.attendance || []).slice(0, 10).map((a) => (
                    <div key={a._id} className="d-flex justify-content-between border-bottom py-1 small">
                      <span>{a.date}</span>
                      <span>{a.checkIn || 'N/A'} - {a.checkOut || 'N/A'}</span>
                      <span className={`badge bg-${a.status === 'present' ? 'success' : 'secondary'}`}>{a.status}</span>
                    </div>
                  ))}
                </>
              )}

              {!selectedMember && !loading && (
                <p className="text-muted text-center mt-4">Select a member to view their progress</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white fw-semibold">
              <i className="bi bi-people me-2"></i>Your Members
            </div>
            <div className="card-body">
              {members.map((m) => (
                <div key={m._id} className="border-bottom py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-0 fw-semibold small">{m.name}</p>
                    <small className="text-muted">{m.email}</small>
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setSelectedMember(m._id)}>View</button>
                </div>
              ))}
              {members.length === 0 && <p className="text-muted text-center mb-0 small">No members assigned</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
