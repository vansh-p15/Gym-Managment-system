import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { useAuth } from '../AuthContext';
import api from '../../utils/api';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/member/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2 text-danger"></i>
        Welcome, {user?.name}!
      </h3>

      <div className="row">
        <DashboardCard icon="bi-calendar-check" title="Attendance This Month" value={`${data?.monthlyAttendance || 0} Days`} color="success" />
        <DashboardCard icon="bi-trophy" title="Current Plan" value={data?.membership?.plan?.name || 'No Plan'} color="danger" />
        <DashboardCard icon="bi-clock-history" title="Days Remaining" value={`${data?.daysRemaining || 0} Days`} color="warning" />
        <DashboardCard icon="bi-lightning" title="Total Attendance" value={`${data?.totalAttendance || 0} Days`} color="info" />
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-danger text-white fw-semibold">
              <i className="bi bi-credit-card me-2"></i>Recent Payments
            </div>
            <div className="card-body">
              {data?.recentPayments?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {data.recentPayments.map((p) => (
                    <li key={p._id} className="list-group-item d-flex justify-content-between">
                      <span>₹{p.amount}</span>
                      <span className={`badge bg-${p.status === 'paid' ? 'success' : 'warning'}`}>{p.status}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No recent payments</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white fw-semibold">
              <i className="bi bi-card-checklist me-2"></i>Membership Info
            </div>
            <div className="card-body">
              {data?.membership ? (
                <>
                  <p className="mb-1"><strong>Plan:</strong> {data.membership.plan?.name}</p>
                  <p className="mb-1"><strong>Start:</strong> {new Date(data.membership.startDate).toLocaleDateString()}</p>
                  <p className="mb-1"><strong>End:</strong> {new Date(data.membership.endDate).toLocaleDateString()}</p>
                  <span className={`badge bg-${data.membership.status === 'active' ? 'success' : 'danger'}`}>{data.membership.status}</span>
                </>
              ) : (
                <p className="text-muted mb-0">No active membership. Please contact admin.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
