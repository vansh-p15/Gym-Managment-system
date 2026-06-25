import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { useAuth } from '../AuthContext';
import api from '../../utils/api';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trainer/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const todaySchedule = data?.todaySchedule || [];
  const members = data?.members || [];

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2 text-danger"></i>
        Welcome, {user?.name}!
      </h3>

      <div className="row">
        <DashboardCard icon="bi-people" title="Assigned Members" value={data?.totalMembers || 0} color="danger" />
        <DashboardCard icon="bi-calendar-week" title="Sessions Today" value={todaySchedule.length} color="success" />
        <DashboardCard icon="bi-clipboard-check" title="Plans Uploaded" value={data?.totalWorkouts || 0} color="info" />
        <DashboardCard icon="bi-graph-up-arrow" title="Progress Updates" value={members.length} color="warning" />
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white fw-semibold">
              <i className="bi bi-calendar-day me-2"></i>Today's Sessions
            </div>
            <div className="card-body">
              {todaySchedule.length > 0 ? (
                todaySchedule.map((s) => (
                  <div key={s._id} className="border rounded p-3 mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 fw-bold">{s.activity}</h6>
                        <small className="text-muted"><i className="bi bi-clock me-1"></i>{s.startTime} - {s.endTime}</small>
                      </div>
                      <span className="badge bg-danger">{s.members?.length || 0} members</span>
                    </div>
                    <div className="mt-1">
                      {(s.members || []).map((m, i) => (
                        <span key={i} className="badge bg-light text-dark me-1">{m.name || m}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center mb-0">No sessions scheduled today</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white fw-semibold">
              <i className="bi bi-people me-2"></i>Assigned Members
            </div>
            <div className="card-body">
              {members.length > 0 ? members.map((m) => (
                <div key={m._id} className="d-flex align-items-center justify-content-between border-bottom py-2">
                  <div className="d-flex align-items-center">
                    <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '35px', height: '35px' }}>
                      <i className="bi bi-person text-danger"></i>
                    </div>
                    <div>
                      <p className="mb-0 fw-semibold small">{m.name}</p>
                      <small className="text-muted">{m.email}</small>
                    </div>
                  </div>
                  <span className={`badge bg-${m.status === 'active' ? 'success' : 'secondary'}`}>{m.status || 'Active'}</span>
                </div>
              )) : (
                <p className="text-muted text-center mb-0">No members assigned yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
