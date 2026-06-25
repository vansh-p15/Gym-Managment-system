import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { downloadCsv } from '../../utils/reportDownload';

const Reports = () => {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics'),
    ]).then(([d, a]) => { setData(d); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const planDist = analytics?.planDistribution || [];
  const totalPlanMembers = planDist.reduce((s, p) => s + p.count, 0) || 1;
  const colors = ['secondary', 'info', 'warning', 'danger', 'success', 'primary'];

  const handleDownloadReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const summaryRows = [
      { section: 'Summary', metric: 'Total Members', value: data?.totalMembers || 0 },
      { section: 'Summary', metric: 'Active Members', value: data?.activeMembers || 0 },
      { section: 'Summary', metric: 'Total Trainers', value: data?.totalTrainers || 0 },
      { section: 'Summary', metric: 'Total Revenue (INR)', value: data?.totalRevenue || 0 },
    ];

    const monthlyRows = (analytics?.monthlyRevenue || []).map((entry) => ({
      section: 'Monthly Revenue',
      month: entry._id,
      revenueInr: entry.total,
    }));

    const planRows = planDist.map((item) => ({
      section: 'Plan Distribution',
      plan: item.planInfo?.name || 'Unknown',
      members: item.count,
      percentage: Math.round((item.count / totalPlanMembers) * 100),
    }));

    const reportRows = [...summaryRows, ...monthlyRows, ...planRows];
    const downloaded = downloadCsv(`admin-report-${today}.csv`, reportRows);

    if (!downloaded) {
      alert('No report data available to download.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-file-earmark-bar-graph me-2 text-danger"></i>Reports
        </h3>
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={handleDownloadReport}
        >
          <i className="bi bi-download me-2"></i>
          Download Admin Report
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <i className="bi bi-people fs-1 text-danger"></i>
              <h4 className="fw-bold mt-2">{data?.totalMembers || 0}</h4>
              <p className="text-muted mb-0">Total Members</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <i className="bi bi-person-check fs-1 text-success"></i>
              <h4 className="fw-bold mt-2">{data?.activeMembers || 0}</h4>
              <p className="text-muted mb-0">Active Members</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <i className="bi bi-person-badge fs-1 text-warning"></i>
              <h4 className="fw-bold mt-2">{data?.totalTrainers || 0}</h4>
              <p className="text-muted mb-0">Trainers</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <i className="bi bi-cash-coin fs-1 text-info"></i>
              <h4 className="fw-bold mt-2">₹{(data?.totalRevenue || 0).toLocaleString()}</h4>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-calendar-month me-2"></i>Monthly Revenue
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.monthlyRevenue || []).map((r, idx) => (
                  <tr key={idx}>
                    <td className="fw-semibold">{r._id}</td>
                    <td className="fw-bold">₹{r.total.toLocaleString()}</td>
                  </tr>
                ))}
                {(!analytics?.monthlyRevenue || analytics.monthlyRevenue.length === 0) && (
                  <tr><td colSpan="2" className="text-center text-muted py-3">No revenue data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-pie-chart me-2"></i>Plan Distribution
        </div>
        <div className="card-body">
          {planDist.map((item, idx) => {
            const percent = Math.round((item.count / totalPlanMembers) * 100);
            return (
              <div key={idx} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">{item.planInfo?.name || 'Unknown'} <span className="text-muted small">({item.count} members)</span></span>
                  <span className="fw-bold">{percent}%</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div className={`progress-bar bg-${colors[idx % colors.length]}`} style={{ width: `${percent}%` }}></div>
                </div>
              </div>
            );
          })}
          {planDist.length === 0 && <p className="text-muted text-center mb-0">No plan distribution data yet</p>}
        </div>
      </div>
    </div>
  );
};

export default Reports;
