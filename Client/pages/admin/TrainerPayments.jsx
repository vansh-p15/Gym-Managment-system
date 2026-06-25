import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { downloadCsv } from '../../utils/reportDownload';
import { useAuth } from '../AuthContext';

const TrainerPayments = () => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { user } = useAuth();
  const [salaryMonth, setSalaryMonth] = useState(currentMonth);
  const [salaryData, setSalaryData] = useState({ month: currentMonth, rows: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [payingTrainer, setPayingTrainer] = useState(null);

  const fetchSalaryData = async (month) => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/trainer-salaries?month=${month}`);
      setSalaryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData(salaryMonth);
  }, [salaryMonth]);

  const handlePayTrainer = async (entry) => {
    const amount = Number(entry?.calculatedAmount || 0);
    if (amount <= 0) {
      alert('No payable salary for this trainer in selected month.');
      return;
    }

    const alreadyPaid = entry?.paymentStatus === 'paid';
    if (alreadyPaid && !window.confirm('This trainer salary is already paid. Pay again with Razorpay?')) {
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('Razorpay library failed to load. Please refresh the page.');
      return;
    }

    setPayingTrainer(entry.trainer?._id);
    try {
      const keyData = await api.get('/payment/key');
      const orderData = await api.post('/admin/trainer-salaries/create-order', {
        trainerId: entry.trainer?._id,
        month: salaryMonth,
      });

      const options = {
        key: keyData?.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FitSphere Gym',
        description: `Trainer Salary - ${orderData.trainerName} (${orderData.month})`,
        order_id: orderData.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#dc3545',
        },
        handler: async (response) => {
          try {
            await api.post('/admin/trainer-salaries/verify', {
              salaryId: orderData.salaryId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            fetchSalaryData(salaryMonth);
          } catch (verifyError) {
            alert(verifyError.message || 'Trainer payment verification failed.');
          } finally {
            setPayingTrainer(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingTrainer(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setPayingTrainer(null);
        alert(`Payment failed: ${response?.error?.description || 'Unknown error'}`);
      });
      razorpay.open();
    } catch (err) {
      setPayingTrainer(null);
      alert(err.message || 'Failed to initiate Razorpay payment.');
    }
  };

  const handleDownloadReport = () => {
    const reportRows = (salaryData.rows || []).map((entry) => ({
      month: salaryData?.month || salaryMonth,
      trainerName: entry.trainer?.name || 'N/A',
      trainerEmail: entry.trainer?.email || 'N/A',
      presentDays: entry.presentDays,
      dailyRateInr: entry.dailyRate,
      calculatedSalaryInr: entry.calculatedAmount,
      paymentStatus: entry.paymentStatus,
      paidAmountInr: entry.paidAmount,
      paidOn: entry.paidOn ? new Date(entry.paidOn).toLocaleDateString() : '',
      method: entry.method || '',
    }));

    const downloaded = downloadCsv(`trainer-payment-report-${salaryData?.month || salaryMonth}.csv`, reportRows);
    if (!downloaded) {
      alert('No trainer payment data available to download.');
    }
  };

  const rows = salaryData?.rows || [];
  const completed = rows.filter((row) => row.paymentStatus === 'paid');
  const pending = rows.filter((row) => row.paymentStatus !== 'paid');

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-cash-stack me-2 text-danger"></i>Trainer Payments
        </h3>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="month"
            className="form-control form-control-sm"
            style={{ width: '170px' }}
            value={salaryMonth}
            onChange={(e) => setSalaryMonth(e.target.value)}
          />
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={handleDownloadReport}>
            <i className="bi bi-download me-1"></i>Download Report
          </button>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-success text-white">
            <div className="card-body">
              <h3 className="fw-bold">Rs {(salaryData?.totals?.totalPaidAmount || 0).toLocaleString()}</h3>
              <p className="mb-0">Total Paid</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-info text-white">
            <div className="card-body">
              <h3 className="fw-bold">{completed.length}</h3>
              <p className="mb-0">Paid Trainers</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-warning text-dark">
            <div className="card-body">
              <h3 className="fw-bold">{pending.length}</h3>
              <p className="mb-0">Pending Trainers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-table me-2"></i>Trainer Salary Report ({salaryData?.month || salaryMonth})
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Trainer</th>
                    <th>Present Days</th>
                    <th>Daily Rate</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Paid On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((entry, idx) => (
                    <tr key={entry.trainer?._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="fw-semibold">{entry.trainer?.name || 'N/A'}</div>
                        <small className="text-muted">{entry.trainer?.email || '-'}</small>
                      </td>
                      <td>{entry.presentDays}</td>
                      <td>Rs {Number(entry.dailyRate || 0).toLocaleString()}</td>
                      <td className="fw-bold">Rs {Number(entry.calculatedAmount || 0).toLocaleString()}</td>
                      <td className="text-capitalize">{entry.method || '-'}</td>
                      <td>
                        <span className={`badge bg-${entry.paymentStatus === 'paid' ? 'success' : 'warning text-dark'}`}>
                          {entry.paymentStatus}
                        </span>
                      </td>
                      <td>{entry.paidOn ? new Date(entry.paidOn).toLocaleDateString() : '-'}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handlePayTrainer(entry)}
                          disabled={
                            payingTrainer === entry.trainer?._id
                            || Number(entry.calculatedAmount || 0) <= 0
                            || entry.paymentStatus === 'paid'
                          }
                        >
                          {payingTrainer === entry.trainer?._id ? 'Processing...' : entry.paymentStatus === 'paid' ? 'Paid' : 'Pay with Razorpay'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan="9" className="text-center text-muted py-4">No trainer salary records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerPayments;
