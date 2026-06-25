import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssignments, saveAssignment } from '../services/db';

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedAssignment = { ...assignment, status: newStatus };
      await saveAssignment(updatedAssignment);
      setAssignment(updatedAssignment);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await getAssignments();
        const found = data.find(a => a.id === id);
        setAssignment(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [id]);

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  if (!assignment) {
    return (
      <div className="dashboard-container">
        <p>Assignment not found.</p>
        <button className="primary-btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container page-with-bottom-nav">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="secondary-btn" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        <h1 style={{ margin: 0 }}>Assignment Details</h1>
      </header>
      
      <div className="assignment-card glass-card" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h2>{assignment.title}</h2>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`status-badge status-${assignment.status}`}>
            {assignment.status.replace('-', ' ')}
          </span>
          <select 
            value={assignment.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--white)', cursor: 'pointer' }}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="card-body" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
          <p><strong>Course:</strong> {assignment.course}</p>
          <p><strong>Due Date:</strong> {assignment.dueDate}</p>
          <p><strong>Created At:</strong> {new Date(assignment.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
