import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Diet = () => {
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/member/diet').then(setDiets).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  const totalCalories = diets.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-egg-fried me-2 text-danger"></i>Diet Plan
      </h3>

      {diets.length > 0 ? (
        <>
          <div className="alert alert-success">
            <i className="bi bi-lightning me-2"></i>
            Daily Target: <strong>{totalCalories} Calories</strong>
          </div>
          <div className="row">
            {diets.map((meal, idx) => (
              <div className="col-md-6 col-lg-4 mb-3" key={idx}>
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-success text-white fw-semibold">
                    <i className="bi bi-clock me-2"></i>{meal.meal}
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {meal.items?.map((item, i) => (
                        <li key={i} className="mb-1"><i className="bi bi-dot text-success fs-4 align-middle"></i>{item}</li>
                      ))}
                    </ul>
                    {meal.notes && <p className="text-muted small mt-2 mb-0">{meal.notes}</p>}
                  </div>
                  <div className="card-footer bg-transparent text-end">
                    <span className="badge bg-success">{meal.calories} cal</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-2"></i>No diet plan assigned yet. Your trainer will assign one soon.</div>
      )}

      <div className="card shadow-sm mt-3">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-droplet me-2"></i>Hydration & Tips
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-bold">Water Intake</h6>
              <p>Drink at least <strong>3-4 liters</strong> of water daily</p>
            </div>
            <div className="col-md-6">
              <h6 className="fw-bold">Tips</h6>
              <ul className="small mb-0">
                <li>Avoid processed foods and sugary drinks</li>
                <li>Eat protein within 30 mins post-workout</li>
                <li>Get 7-8 hours of sleep for recovery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diet;
