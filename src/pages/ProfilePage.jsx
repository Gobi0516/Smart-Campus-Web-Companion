import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const DEFAULT_PROFILE = {
  name: '',
  studentId: '',
  totalCreditsRequired: 120,
  completedCourses: []
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  
  // Profile Form state
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [editTotalCredits, setEditTotalCredits] = useState('');
  
  // Course Form state
  const [courseCode, setCourseCode] = useState('');
  const [courseCredits, setCourseCredits] = useState('');
  const [courseGrade, setCourseGrade] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  useEffect(() => {
    const stored = localStorage.getItem('smart-campus-profile');
    if (stored) {
      try {
        setProfile(JSON.parse(stored));
      } catch(e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const saveProfileToStorage = (newProfile) => {
    localStorage.setItem('smart-campus-profile', JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...profile,
      name: editName,
      studentId: editId,
      totalCreditsRequired: Number(editTotalCredits) || 120
    };
    saveProfileToStorage(updated);
    setIsEditingProfile(false);
  };

  const openEditProfile = () => {
    setEditName(profile.name);
    setEditId(profile.studentId);
    setEditTotalCredits(profile.totalCreditsRequired);
    setIsEditingProfile(true);
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseCredits) return;
    
    const newCourse = {
      code: courseCode.trim().toUpperCase(),
      credits: Number(courseCredits),
      grade: courseGrade.trim().toUpperCase()
    };
    
    const updated = {
      ...profile,
      completedCourses: [...profile.completedCourses, newCourse]
    };
    
    saveProfileToStorage(updated);
    
    setCourseCode('');
    setCourseCredits('');
    setCourseGrade('');
    setIsAddingCourse(false);
  };

  const handleRemoveCourse = (index) => {
    const newCourses = [...profile.completedCourses];
    newCourses.splice(index, 1);
    saveProfileToStorage({ ...profile, completedCourses: newCourses });
  };

  const completedCredits = useMemo(() => {
    return profile.completedCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  }, [profile.completedCourses]);

  const progressPercentage = useMemo(() => {
    const required = Number(profile.totalCreditsRequired) || 1;
    const p = (completedCredits / required) * 100;
    return Math.min(Math.max(p, 0), 100);
  }, [completedCredits, profile.totalCreditsRequired]);

  return (
    <div className="profile-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Profile</h1>
        <button className="secondary-btn small-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="profile-card glass-card">
        {!isEditingProfile ? (
          <div className="profile-info">
            <div className="profile-header-row">
              <h2>Student Information</h2>
              <button className="secondary-btn small-btn" onClick={openEditProfile}>Edit</button>
            </div>
            <div className="profile-details">
              <p><strong>Name:</strong> <span>{profile.name || 'Not set'}</span></p>
              <p><strong>Student ID:</strong> <span>{profile.studentId || 'Not set'}</span></p>
              <p><strong>Required Credits:</strong> <span>{profile.totalCreditsRequired}</span></p>
            </div>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <h2>Edit Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Student ID</label>
              <input type="text" value={editId} onChange={e => setEditId(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Total Credits Required</label>
              <input type="number" min="1" value={editTotalCredits} onChange={e => setEditTotalCredits(e.target.value)} required />
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setIsEditingProfile(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Save</button>
            </div>
          </form>
        )}
      </div>

      <div className="progress-section glass-card">
        <h2>Degree Progress</h2>
        <div className="progress-stats">
          <span className="credits-completed">{completedCredits} Credits Completed</span>
          <span className="credits-required">{profile.totalCreditsRequired} Required</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className="progress-percentage">{progressPercentage.toFixed(1)}% Completed</p>
      </div>

      <div className="courses-section glass-card">
        <div className="courses-header-row">
          <h2>Completed Courses</h2>
          {!isAddingCourse && (
            <button className="primary-btn small-btn" onClick={() => setIsAddingCourse(true)}>+ Add Course</button>
          )}
        </div>

        {isAddingCourse && (
          <form className="course-form" onSubmit={handleAddCourse}>
            <div className="form-row">
              <div className="form-group">
                <label>Course Code</label>
                <input type="text" placeholder="e.g. CS101" value={courseCode} onChange={e => setCourseCode(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Credits</label>
                <input type="number" min="1" max="10" placeholder="e.g. 3" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Grade (Optional)</label>
                <input type="text" placeholder="e.g. A, B+" value={courseGrade} onChange={e => setCourseGrade(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setIsAddingCourse(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Add</button>
            </div>
          </form>
        )}

        <div className="courses-list">
          {profile.completedCourses.length === 0 ? (
            <p className="empty-state">No completed courses added yet.</p>
          ) : (
            profile.completedCourses.map((course, idx) => (
              <div key={idx} className="course-item">
                <div className="course-info-group">
                  <span className="course-code">{course.code}</span>
                  <span className="course-credits">{course.credits} Credits</span>
                  {course.grade && <span className="course-grade">Grade: {course.grade}</span>}
                </div>
                <button className="danger-btn" onClick={() => handleRemoveCourse(idx)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
