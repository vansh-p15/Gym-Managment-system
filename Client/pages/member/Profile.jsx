import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignedTrainer, setAssignedTrainer] = useState(null);

  useEffect(() => {
    api.get('/member/profile').then((data) => {
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        age: data.age || '',
        weight: data.weight || '',
        height: data.height || '',
        gender: data.gender || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || '',
      });
      setAssignedTrainer(data.assignedTrainer);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/member/profile', profile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !profile) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">
          <i className="bi bi-person me-2 text-danger"></i>My Profile
        </h3>
        <button className={`btn ${isEditing ? 'btn-success' : 'btn-danger'}`} onClick={isEditing ? handleSave : () => setIsEditing(true)}>
          <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-pencil'} me-1`}></i>
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm text-center p-4">
            <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '100px', height: '100px' }}>
              <i className="bi bi-person-fill display-4 text-danger"></i>
            </div>
            <h4 className="fw-bold">{profile.name}</h4>
            <p className="text-muted">{profile.email}</p>
            <span className="badge bg-danger">Member</span>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white fw-semibold">Personal Information</div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  { label: 'Full Name', name: 'name', type: 'text' },
                  { label: 'Email', name: 'email', type: 'email' },
                  { label: 'Phone', name: 'phone', type: 'tel' },
                  { label: 'Age', name: 'age', type: 'number' },
                  { label: 'Weight (kg)', name: 'weight', type: 'number' },
                  { label: 'Height (cm)', name: 'height', type: 'number' },
                  { label: 'Gender', name: 'gender', type: 'text' },
                  { label: 'Address', name: 'address', type: 'text' },
                  { label: 'Emergency Contact', name: 'emergencyContact', type: 'tel' },
                ].map((field) => (
                  <div className="col-md-6" key={field.name}>
                    <label className="form-label fw-semibold">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      className="form-control"
                      value={profile[field.name]}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {assignedTrainer && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow-sm border-primary">
              <div className="card-header bg-primary text-white fw-semibold">
                <i className="bi bi-person-badge me-2"></i>Your Assigned Trainer
              </div>
              <div className="card-body">
                <div className="text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person-fill display-5 text-primary"></i>
                  </div>
                  <h5 className="fw-bold mb-2">{assignedTrainer.name}</h5>
                  {assignedTrainer.specialization && (
                    <p className="text-muted mb-2">
                      <strong>Specialization:</strong> {assignedTrainer.specialization}
                    </p>
                  )}
                  {assignedTrainer.phone && (
                    <p className="mb-2">
                      <i className="bi bi-telephone me-2 text-primary"></i>
                      <span>{assignedTrainer.phone}</span>
                    </p>
                  )}
                  {assignedTrainer.email && (
                    <p className="mb-0">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      <span>{assignedTrainer.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default Profile
