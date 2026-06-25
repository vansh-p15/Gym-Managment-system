import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Workout = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/member/workouts').then(setWorkouts).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>;

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-activity me-2 text-danger"></i>Workout Plan
      </h3>

      {workouts.length > 0 ? (
        <>
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Workout plan assigned by your trainer <strong>{workouts[0]?.trainer?.name || 'Trainer'}</strong>.
          </div>
          <div className="row">
            {workouts.map((day, idx) => (
              <div className="col-md-6 col-lg-4 mb-3" key={idx}>
                <div className="card shadow-sm h-100">
                  <div className="card-header bg-danger text-white fw-semibold">
                    <i className="bi bi-calendar-day me-2"></i>{day.day}
                  </div>
                  <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr><th>Exercise</th><th className="text-center">Sets</th><th className="text-center">Reps</th></tr>
                      </thead>
                      <tbody>
                        {day.exercises.map((ex, i) => (
                          <tr key={i}><td>{ex.name}</td><td className="text-center">{ex.sets}</td><td className="text-center">{ex.reps}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="alert alert-warning"><i className="bi bi-exclamation-triangle me-2"></i>No workout plan assigned yet. Your trainer will assign one soon.</div>
      )}
    </div>
  );
};

export default Workout;
