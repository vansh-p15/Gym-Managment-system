import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AssignedMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/trainer/members').then(setMembers).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-people me-2 text-danger"></i>Assigned Members
      </h3>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        You have <strong>{members.length}</strong> members assigned to you.
      </div>

      <div className="row">
        {members.map((member) => (
          <div className="col-md-6 col-lg-4 mb-3" key={member._id}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-person-fill fs-4 text-danger"></i>
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{member.name}</h5>
                    <small className="text-muted">{member.email}</small>
                  </div>
                </div>
                <hr />
                <p className="mb-1 small"><i className="bi bi-phone me-2"></i>{member.phone || 'N/A'}</p>
                <p className="mb-1 small"><i className="bi bi-gender-ambiguous me-2"></i>Gender: <strong>{member.gender || 'N/A'}</strong></p>
                <p className="mb-1 small"><i className="bi bi-calendar me-2"></i>Age: {member.age || 'N/A'}</p>
                <div className="mt-2">
                  <span className={`badge bg-${member.status === 'active' ? 'success' : 'danger'}`}>{member.status || 'active'}</span>
                </div>
              </div>
              <div className="card-footer bg-transparent d-flex gap-2">
                <button className="btn btn-sm btn-outline-danger flex-grow-1">
                  <i className="bi bi-activity me-1"></i>Workout
                </button>
                <button className="btn btn-sm btn-outline-success flex-grow-1">
                  <i className="bi bi-graph-up me-1"></i>Progress
                </button>
              </div>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-12">
            <div className="alert alert-warning text-center">No members assigned to you yet.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedMembers;
