import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const WorkoutUpload = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [day, setDay] = useState('Monday');
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/trainer/members').then(setMembers).catch(console.error);
  }, []);

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '' }]);
  };

  const removeExercise = (idx) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const handleExerciseChange = (idx, field, value) => {
    const updated = [...exercises];
    updated[idx][field] = value;
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) { alert('Please select a member'); return; }
    setSaving(true);
    try {
      await api.post('/trainer/workout', { memberId: selectedMember, day, exercises });
      alert(`Workout plan uploaded for ${members.find(m => m._id === selectedMember)?.name}!`);
      setExercises([{ name: '', sets: '', reps: '' }]);
    } catch (err) {
      alert(err.message || 'Failed to upload workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h3 className="fw-bold mb-4">
        <i className="bi bi-upload me-2 text-danger"></i>Upload Workout Plan
      </h3>

      <div className="card shadow-sm">
        <div className="card-header bg-danger text-white fw-semibold">
          <i className="bi bi-clipboard-plus me-2"></i>Create Workout Plan
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Select Member</label>
              <select className="form-select" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} required>
                <option value="">Choose a member...</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Day</label>
              <select className="form-select" value={day} onChange={(e) => setDay(e.target.value)}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <h6 className="fw-bold mt-4 mb-3">Exercises</h6>
            {exercises.map((ex, idx) => (
              <div key={idx} className="row g-2 mb-2 align-items-end">
                <div className="col-md-5">
                  <label className="form-label small">Exercise Name</label>
                  <input type="text" className="form-control form-control-sm" placeholder="e.g., Bench Press" value={ex.name} onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Sets</label>
                  <input type="number" className="form-control form-control-sm" placeholder="4" value={ex.sets} onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)} required min="1" />
                </div>
                <div className="col-md-2">
                  <label className="form-label small">Reps</label>
                  <input type="number" className="form-control form-control-sm" placeholder="12" value={ex.reps} onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)} required min="1" />
                </div>
                <div className="col-md-2">
                  {exercises.length > 1 && (
                    <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => removeExercise(idx)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-success mt-2" onClick={addExercise}>
              <i className="bi bi-plus-circle me-1"></i>Add Exercise
            </button>

            <hr />
            <button type="submit" className="btn btn-danger" disabled={saving}>
              <i className="bi bi-upload me-2"></i>{saving ? 'Uploading...' : 'Upload Workout Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutUpload;
