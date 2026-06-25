import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const PaymentRecords = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/payments').then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const completed = payments.filter(p => p.status === 'paid');
  const pending = payments.filter(p => p.status === 'pending');
  const totalRevenue = completed.reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-cash-stack me-2 text-danger"></i>Payment Records
      </h3>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-success text-white">
            <div className="card-body">
              <h3 className="fw-bold">₹{totalRevenue.toLocaleString()}</h3>
              <p className="mb-0">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-info text-white">
            <div className="card-body">
              <h3 className="fw-bold">{completed.length}</h3>
              <p className="mb-0">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-warning text-dark">
            <div className="card-body">
              <h3 className="fw-bold">{pending.length}</h3>
              <p className="mb-0">Pending</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{p.member?.name || 'N/A'}</td>
                    <td><span className="badge bg-info">{p.plan?.name || 'N/A'}</span></td>
                    <td className="fw-bold">₹{p.amount}</td>
                    <td>{p.method || 'N/A'}</td>
                    <td>{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`badge bg-${p.status === 'paid' ? 'success' : 'warning'}`}>{p.status}</span>
                    </td>
                    <td>
                      <small className="font-monospace">{p.transactionId || '-'}</small>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan="8" className="text-center text-muted py-4">No payment records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRecords;
