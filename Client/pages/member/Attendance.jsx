import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../../utils/api';

const Attendance = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markedToday, setMarkedToday] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const fetchData = async () => {
    try {
      const [recordsData, todayData] = await Promise.all([
        api.get('/member/attendance'),
        api.get('/member/attendance/today')
      ]);
      setRecords(recordsData);
      if (todayData && todayData.checkIn) {
        setMarkedToday(true);
        setCheckInTime(todayData.checkIn);
        if (todayData.checkOut) setCheckOutTime(todayData.checkOut);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    try {
      const data = await api.post('/member/attendance/checkin', {});
      setCheckInTime(data.checkIn);
      setMarkedToday(true);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    try {
      const data = await api.put('/member/attendance/checkout', {});
      setCheckOutTime(data.checkOut);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const presentDays = records.filter((a) => a.status === 'present').length;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-calendar-check me-2 text-danger"></i>My Attendance
      </h3>

      {/* Mark Attendance Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm text-center">
            <div className="card-header bg-danger text-white fw-semibold">
              <i className="bi bi-check2-circle me-2"></i>Mark Attendance
            </div>
            <div className="card-body py-4">
              <div className="mb-3">
                <i className="bi bi-calendar-event fs-1 text-danger"></i>
                <h5 className="fw-bold mt-2">{today}</h5>
                <p className="text-muted mb-0">
                  <i className="bi bi-person me-1"></i>{user?.name}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>{error}
                </div>
              )}

              {!markedToday ? (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                  )}
                  Check In
                </button>
              ) : !checkOutTime ? (
                <div>
                  <div className="alert alert-success py-2 mb-3">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Checked in at <strong>{checkInTime}</strong>
                  </div>
                  <button
                    className="btn btn-warning btn-lg"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-box-arrow-right me-2"></i>
                    )}
                    Check Out
                  </button>
                </div>
              ) : (
                <div>
                  <div className="alert alert-success py-2 mb-2">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Checked in at <strong>{checkInTime}</strong>
                  </div>
                  <div className="alert alert-secondary py-2 mb-2">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Checked out at <strong>{checkOutTime}</strong>
                  </div>
                  <span className="badge bg-success fs-6 p-2">
                    <i className="bi bi-clock me-1"></i>
                    Today's session complete!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-success text-white">
            <div className="card-body">
              <h2 className="fw-bold">{presentDays}</h2>
              <p className="mb-0">Days Present</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-danger text-white">
            <div className="card-body">
              <h2 className="fw-bold">{records.length - presentDays}</h2>
              <p className="mb-0">Days Absent</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center bg-info text-white">
            <div className="card-body">
              <h2 className="fw-bold">{records.length > 0 ? Math.round((presentDays / records.length) * 100) : 0}%</h2>
              <p className="mb-0">Attendance Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-table me-2"></i>Attendance Log
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((a, idx) => (
                  <tr key={a._id}>
                    <td>{idx + 1}</td>
                    <td>{a.date}</td>
                    <td>{a.checkIn || '-'}</td>
                    <td>{a.checkOut || '-'}</td>
                    <td>
                      <span className={`badge bg-${a.status === 'present' ? 'success' : 'danger'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted py-4">No attendance records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
