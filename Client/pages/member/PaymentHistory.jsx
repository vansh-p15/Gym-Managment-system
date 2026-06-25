import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { downloadCsv } from '../../utils/reportDownload';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/member/payments').then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const reportRows = [
      {
        section: 'Summary',
        metric: 'Total Payments',
        value: payments.length,
      },
      {
        section: 'Summary',
        metric: 'Successful Payments',
        value: payments.filter((payment) => payment.status === 'paid').length,
      },
      {
        section: 'Summary',
        metric: 'Pending Payments',
        value: payments.filter((payment) => payment.status === 'pending').length,
      },
      {
        section: 'Summary',
        metric: 'Total Spent (INR)',
        value: totalSpent,
      },
      ...payments.map((payment, index) => ({
        section: 'Payment Record',
        serialNumber: index + 1,
        date: new Date(payment.date).toLocaleDateString('en-IN'),
        plan: payment.plan?.name || '-',
        amountInr: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId || '-',
      })),
    ];

    const downloaded = downloadCsv(`member-payment-report-${today}.csv`, reportRows);
    if (!downloaded) {
      alert('No report data available to download.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-receipt me-2 text-danger"></i>Payment History
        </h3>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={handleDownloadReport}
        >
          <i className="bi bi-download me-2"></i>
          Download User Report
        </button>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h4 className="text-danger fw-bold">₹{totalSpent}</h4>
              <small className="text-muted">Total Spent</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h4 className="text-success fw-bold">{payments.filter(p => p.status === 'paid').length}</h4>
              <small className="text-muted">Successful Payments</small>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <h4 className="text-warning fw-bold">{payments.filter(p => p.status === 'pending').length}</h4>
              <small className="text-muted">Pending</small>
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
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.plan?.name || '-'}</td>
                    <td className="fw-semibold">₹{p.amount}</td>
                    <td className="text-capitalize">{p.method}</td>
                    <td>
                      <span className={`badge bg-${p.status === 'paid' ? 'success' : 'warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted font-monospace">
                        {p.transactionId || '-'}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
