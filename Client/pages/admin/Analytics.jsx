import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import api from '../../utils/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/dashboard'),
    ]).then(([a, d]) => { setAnalytics(a); setDashboard(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const monthlyRev = analytics?.monthlyRevenue || [];
  const planDist = analytics?.planDistribution || [];
  const monthlySign = analytics?.monthlySignups || [];

  const revenueData = {
    labels: monthlyRev.map(r => r._id),
    datasets: [{
      label: 'Revenue (₹)',
      data: monthlyRev.map(r => r.total),
      backgroundColor: 'rgba(220, 53, 69, 0.7)',
      borderColor: '#dc3545',
      borderWidth: 1,
    }],
  };

  const membershipData = {
    labels: planDist.map(p => p.planInfo?.name || 'Unknown'),
    datasets: [{
      data: planDist.map(p => p.count),
      backgroundColor: ['#6c757d', '#0dcaf0', '#ffc107', '#dc3545', '#198754', '#0d6efd'],
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const signupData = {
    labels: monthlySign.map(s => s._id),
    datasets: [{
      label: 'New Members',
      data: monthlySign.map(s => s.count),
      borderColor: '#198754',
      backgroundColor: 'rgba(25, 135, 84, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true } },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-bar-chart-line me-2 text-danger"></i>Analytics Dashboard
      </h3>

      <div className="row">
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-danger text-white fw-semibold">
              <i className="bi bi-cash-coin me-2"></i>Monthly Revenue
            </div>
            <div className="card-body">
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white fw-semibold">
              <i className="bi bi-pie-chart me-2"></i>Plan Distribution
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <Doughnut data={membershipData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white fw-semibold">
              <i className="bi bi-graph-up me-2"></i>Monthly Signups
            </div>
            <div className="card-body">
              <Line data={signupData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {[
          { title: 'Total Members', value: dashboard?.totalMembers || 0, icon: 'bi-people', color: 'danger' },
          { title: 'Active Trainers', value: dashboard?.totalTrainers || 0, icon: 'bi-person-badge', color: 'success' },
          { title: 'Total Revenue', value: `₹${(dashboard?.totalRevenue || 0).toLocaleString()}`, icon: 'bi-cash', color: 'info' },
          { title: 'Active Memberships', value: dashboard?.activeMemberships || 0, icon: 'bi-card-checklist', color: 'warning' },
        ].map((stat, idx) => (
          <div className="col-md-3 mb-3" key={idx}>
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <i className={`bi ${stat.icon} fs-2 text-${stat.color}`}></i>
                <h4 className="fw-bold mt-2">{stat.value}</h4>
                <small className="text-muted">{stat.title}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
