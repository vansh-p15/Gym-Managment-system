import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AttendanceTracking = () => {
  const [records, setRecords] = useState([]);
  const [trainerRecords, setTrainerRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  const loadData = async (date) => {
    setLoading(true);
    try {
      const memberUrl = date ? `/admin/attendance?date=${date}` : '/admin/attendance';
      const trainerUrl = date ? `/admin/trainer-attendance?date=${date}` : '/admin/trainer-attendance';
      const [memberAttendance, trainerAttendance] = await Promise.all([
        api.get(memberUrl),
        api.get(trainerUrl),
      ]);
      setRecords(memberAttendance);
      setTrainerRecords(trainerAttendance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(dateFilter);
  }, [dateFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/admin/attendance/${id}`);
      loadData(dateFilter);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTrainerDelete = async (id) => {
    if (!window.confirm('Delete this trainer attendance record?')) return;
    try {
      await api.delete(`/admin/trainer-attendance/${id}`);
      loadData(dateFilter);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const memberPresent = records.filter((a) => a.status === 'present').length;
  const trainerPresent = trainerRecords.filter((a) => a.status === 'present').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-calendar-check me-2 text-danger"></i>Attendance Tracking
        </h3>
      </div>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-success text-white">
            <div className="card-body">
              <h3 className="fw-bold">{memberPresent}</h3>
              <p className="mb-0">Member Present</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-danger text-white">
            <div className="card-body">
              <h3 className="fw-bold">{trainerPresent}</h3>
              <p className="mb-0">Trainer Present</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm text-center bg-info text-white">
            <div className="card-body">
              <h3 className="fw-bold">{records.length}</h3>
              <p className="mb-0">Member Records</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <label className="form-label fw-semibold small">Filter by Date</label>
              <input type="date" className="form-control" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              {dateFilter && <button className="btn btn-sm btn-outline-secondary mt-2" onClick={() => setDateFilter('')}>Clear</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-table me-2"></i>Member Attendance Records
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((a, idx) => (
                  <tr key={a._id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{a.member?.name || 'N/A'}</td>
                    <td>{a.date}</td>
                    <td>{a.checkIn || '-'}</td>
                    <td>{a.checkOut || '-'}</td>
                    <td>
                      <span className={`badge bg-${a.status === 'present' ? 'success' : 'danger'}`}>{a.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No attendance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-person-workspace me-2"></i>Trainer Attendance Records
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Trainer</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainerRecords.map((a, idx) => (
                  <tr key={a._id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{a.trainer?.name || 'N/A'}</td>
                    <td>{a.date}</td>
                    <td>{a.checkIn || '-'}</td>
                    <td>{a.checkOut || '-'}</td>
                    <td>
                      <span className={`badge bg-${a.status === 'present' ? 'success' : 'danger'}`}>{a.status}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleTrainerDelete(a._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {trainerRecords.length === 0 && (
                  <tr><td colSpan="7" className="text-center text-muted py-4">No trainer attendance records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;
