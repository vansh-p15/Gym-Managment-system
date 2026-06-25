import React, { useState, useEffect } from 'react';
import DashboardCard from '../../components/DashboardCard';
import { useAuth } from '../AuthContext';
import api from '../../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2 text-danger"></i>
        Admin Dashboard
      </h3>

      <div className="row">
        <DashboardCard icon="bi-people" title="Total Members" value={data?.totalMembers || 0} color="danger" />
        <DashboardCard icon="bi-person-badge" title="Active Trainers" value={data?.totalTrainers || 0} color="success" />
        <DashboardCard icon="bi-cash-stack" title="Total Revenue" value={`₹${(data?.totalRevenue || 0).toLocaleString()}`} color="warning" />
        <DashboardCard icon="bi-calendar-check" title="Today's Member Attendance" value={data?.todayAttendance || 0} color="info" />
      </div>

      <div className="row mt-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-danger text-white">
            <div className="card-body">
              <h2 className="fw-bold">{data?.activeMemberships || 0}</h2>
              <p className="mb-0">Active Memberships</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-success text-white">
            <div className="card-body">
              <h2 className="fw-bold">{data?.activeMembers || 0}</h2>
              <p className="mb-0">Active Members</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-info text-white">
            <div className="card-body">
              <h2 className="fw-bold">{data?.totalTrainers || 0}</h2>
              <p className="mb-0">Total Trainers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-secondary text-white">
            <div className="card-body">
              <h2 className="fw-bold">₹{(data?.totalTrainerPayout || 0).toLocaleString()}</h2>
              <p className="mb-0">Trainer Salary Paid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-light border mt-2 mb-0">
        <i className="bi bi-person-workspace me-2 text-danger"></i>
        Today's trainer attendance: <strong>{data?.todayTrainerAttendance || 0}</strong>
      </div>
    </div>
  );
};

export default AdminDashboard;
