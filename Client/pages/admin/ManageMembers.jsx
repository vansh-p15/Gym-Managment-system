import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', status: 'active', gender: '', age: '', assignedTrainer: '' });
  const [search, setSearch] = useState('');

  const fetchMembers = () => {
    api.get('/admin/members').then(setMembers).catch(console.error).finally(() => setLoading(false));
  };

  const fetchTrainers = () => {
    api.get('/admin/trainers').then(setTrainers).catch(console.error);
  };

  useEffect(() => { fetchMembers(); fetchTrainers(); }, []);

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({ name: member.name, phone: member.phone || '', status: member.status || 'active', gender: member.gender || '', age: member.age || '', assignedTrainer: member.assignedTrainer?._id || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert('Name is required'); return; }
    try {
      await api.put(`/admin/members/${editingMember._id}`, form);
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to update member');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/admin/members/${id}`);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-people me-2 text-danger"></i>Manage Members
        </h3>
        <span className="badge bg-danger fs-6">{members.length} members</span>
      </div>

      <div className="mb-3">
        <input type="text" className="form-control" placeholder="Search members by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Trainer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, idx) => (
                  <tr key={m._id}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.phone || 'N/A'}</td>
                    <td>{m.gender || 'N/A'}</td>
                    <td>{m.age || 'N/A'}</td>
                    <td>{m.assignedTrainer?.name || <span className="text-muted">Not assigned</span>}</td>
                    <td>
                      <span className={`badge bg-${m.status === 'active' ? 'success' : 'danger'}`}>{m.status || 'active'}</span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(m)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(m._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Edit Member</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                {['name', 'phone'].map((field) => (
                  <div className="mb-3" key={field}>
                    <label className="form-label text-capitalize fw-semibold">{field}</label>
                    <input type="text" className="form-control" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                  </div>
                ))}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Gender</label>
                  <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Age</label>
                  <input type="number" className="form-control" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Assigned Trainer</label>
                  <select className="form-select" value={form.assignedTrainer} onChange={(e) => setForm({ ...form, assignedTrainer: e.target.value })}>
                    <option value="">No Trainer</option>
                    {trainers.map((trainer) => (
                      <option key={trainer._id} value={trainer._id}>
                        {trainer.name} {trainer.specialization ? `(${trainer.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleSave}>
                  <i className="bi bi-check-lg me-1"></i>Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;
