import React, { useState, useEffect } from 'react';
import { getAssignments, saveAssignment } from '../services/db';
import '../styles/AssignmentsPage.css';

const COURSES = ['CS101', 'MATH201', 'ENG102', 'PHY101', 'ART105'];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('All');
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await getAssignments();
      setAssignments(data || []);
    } catch (error) {
      console.error("Failed to load assignments", error);
    }
  };

  const getErrors = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Title is required";
    if (!course) errs.course = "Course is required";
    if (!dueDate) {
      errs.dueDate = "Due date is required";
    } else {
      const today = new Date();
      today.setHours(0,0,0,0);
      const [year, month, day] = dueDate.split('-').map(Number);
      if (year && month && day) {
        const selectedDate = new Date(year, month - 1, day);
        if (selectedDate < today) {
          errs.dueDate = "Due date cannot be in the past";
        }
      } else {
        errs.dueDate = "Invalid date format";
      }
    }
    return errs;
  };

  const currentErrors = getErrors();
  const isFormValid = Object.keys(currentErrors).length === 0;

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setTouched({ title: true, course: true, dueDate: true });
      return;
    }
    
    const assignment = {
      id: editingId || crypto.randomUUID(),
      title,
      course,
      dueDate,
      status,
      createdAt: editingId ? assignments.find(a => a.id === editingId).createdAt : new Date().toISOString()
    };
    
    await saveAssignment(assignment);
    await loadAssignments();
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setCourse('');
    setDueDate('');
    setStatus('pending');
    setTouched({});
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setCourse(assignment.course);
    setDueDate(assignment.dueDate);
    setStatus(assignment.status);
    setTouched({});
    setShowForm(true);
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'Pending') return a.status === 'pending';
    if (filter === 'In Progress') return a.status === 'in-progress';
    if (filter === 'Done') return a.status === 'done';
    return true;
  });

  return (
    <div className="assignments-page">
      <header className="page-header">
        <h1>Assignments</h1>
        {!showForm && (
          <button className="primary-btn" onClick={() => setShowForm(true)}>+ Add Assignment</button>
        )}
      </header>
      
      {showForm && (
        <div className="form-container glass-card">
          <h2>{editingId ? 'Edit Assignment' : 'New Assignment'}</h2>
          <form onSubmit={handleSubmit} className="assignment-form">
            <div className="form-group">
              <label>Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                onBlur={() => handleBlur('title')}
                placeholder="E.g., Read Chapter 5"
              />
              {touched.title && currentErrors.title && <span className="error-text">{currentErrors.title}</span>}
            </div>
            
            <div className="form-group">
              <label>Course</label>
              <select 
                value={course} 
                onChange={e => setCourse(e.target.value)} 
                onBlur={() => handleBlur('course')}
              >
                <option value="">Select a course</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {touched.course && currentErrors.course && <span className="error-text">{currentErrors.course}</span>}
            </div>
            
            <div className="form-group">
              <label>Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                onBlur={() => handleBlur('dueDate')}
              />
              {touched.dueDate && currentErrors.dueDate && <span className="error-text">{currentErrors.dueDate}</span>}
            </div>
            
            {editingId && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={!isFormValid}>Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-scroll-container">
        <div className="segmented-control">
          {['All', 'Pending', 'In Progress', 'Done'].map(f => (
            <button 
              key={f}
              className={`segment-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="assignments-list">
        {filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <p>No assignments found.</p>
          </div>
        ) : (
          filteredAssignments.map(assignment => (
            <div key={assignment.id} className="assignment-card glass-card" onClick={() => handleEdit(assignment)}>
              <div className="card-header">
                <h3>{assignment.title}</h3>
                <span className={`status-badge status-${assignment.status}`}>{assignment.status.replace('-', ' ')}</span>
              </div>
              <div className="card-body">
                <p><strong>Course:</strong> {assignment.course}</p>
                <p><strong>Due:</strong> {assignment.dueDate}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
