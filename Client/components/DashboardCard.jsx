import React from 'react';

const DashboardCard = ({ icon, title, value, color = 'danger', subtitle }) => {
  return (
    <div className="col-md-6 col-lg-3 mb-3">
      <div className={`card border-0 shadow-sm h-100`}>
        <div className="card-body d-flex align-items-center">
          <div className={`bg-${color} bg-opacity-10 rounded-3 p-3 me-3`}>
            <i className={`bi ${icon} fs-3 text-${color}`}></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold">{value}</h4>
            <small className="text-muted">{title}</small>
            {subtitle && <div><small className="text-secondary">{subtitle}</small></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
