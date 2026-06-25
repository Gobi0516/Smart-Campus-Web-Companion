import { useState, useEffect } from 'react';
import { getLectures, saveLecture, deleteLecture } from '../services/db';

// Format Date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

// Format time (HH:MM) to 12-hour AM/PM string
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  let [hours, minutes] = time24.split(':');
  hours = parseInt(hours, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const TYPES = ['Lecture', 'Tutorial', 'Lab'];

const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    room: '',
    instructor: '',
    type: 'Lecture',
    startTime: '',
    endTime: ''
  });

  const loadLectures = async () => {
    try {
      setLoading(true);
      const allLectures = await getLectures();
      
      // Seed with mock data if completely empty
      if (allLectures.length === 0) {
        const mockData = [
          { id: '1', date: formatDate(new Date()), title: 'Data Structures', startTime: '09:00', endTime: '10:30', room: 'Room 301', instructor: 'Dr. Smith', type: 'Lecture' },
          { id: '2', date: formatDate(new Date()), title: 'Calculus II', startTime: '11:00', endTime: '12:30', room: 'Room 205', instructor: 'Prof. Johnson', type: 'Tutorial' },
          { id: '3', date: formatDate(new Date()), title: 'Physics Lab', startTime: '14:00', endTime: '16:00', room: 'Lab 4', instructor: 'Dr. Lee', type: 'Lab' },
          { id: '4', date: formatDate(new Date()), title: 'Web Development', startTime: '16:15', endTime: '17:45', room: 'Room 102', instructor: 'Mr. Brown', type: 'Lecture' }
        ];
        for (const item of mockData) {
          await saveLecture(item);
        }
        allLectures.push(...mockData);
      }
      
      const dayLectures = allLectures
        .filter(l => l.date === currentDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
        
      setLectures(dayLectures);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, [currentDate]);

  const changeDate = (days) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(formatDate(d));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.room) return;

    const lectureToSave = {
      id: editingId || crypto.randomUUID(),
      date: currentDate,
      ...formData
    };

    try {
      await saveLecture(lectureToSave);
      resetForm();
      loadLectures();
    } catch (err) {
      setError('Failed to save schedule.');
    }
  };

  const handleEdit = (lecture) => {
    setEditingId(lecture.id);
    setFormData({
      title: lecture.title,
      room: lecture.room,
      instructor: lecture.instructor,
      type: lecture.type,
      startTime: lecture.startTime,
      endTime: lecture.endTime
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this class?')) {
      try {
        await deleteLecture(id);
        loadLectures();
      } catch (err) {
        setError('Failed to delete schedule.');
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      room: '',
      instructor: '',
      type: 'Lecture',
      startTime: '',
      endTime: ''
    });
  };

  const getDisplayDate = () => {
    const today = formatDate(new Date());
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = formatDate(tomorrowDate);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = formatDate(yesterdayDate);

    if (currentDate === today) return "Today's Schedule";
    if (currentDate === tomorrow) return "Tomorrow's Schedule";
    if (currentDate === yesterday) return "Yesterday's Schedule";
    
    return new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1>{getDisplayDate()}</h1>
            <p>Here are your classes for {currentDate}.</p>
          </div>
          {!showForm && (
            <button className="primary-btn small-btn" onClick={() => setShowForm(true)}>+ Add Class</button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--card-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button className="secondary-btn small-btn" style={{ flex: 1 }} onClick={() => changeDate(-1)}>&larr; Prev</button>
          <input 
            type="date" 
            value={currentDate} 
            onChange={(e) => setCurrentDate(e.target.value)}
            style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px', textAlign: 'center' }}
          />
          <button className="secondary-btn small-btn" style={{ flex: 1 }} onClick={() => changeDate(1)}>Next &rarr;</button>
        </div>
      </header>

      <main className="dashboard-main">
        {showForm && (
          <div className="form-container glass-card" style={{ marginBottom: '2rem' }}>
            <h2>{editingId ? 'Edit Class' : 'New Class'}</h2>
            <form onSubmit={handleSubmit} className="assignment-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Room</label>
                  <input type="text" name="room" value={formData.room} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Instructor</label>
                <input type="text" name="instructor" value={formData.instructor} onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="button" className="secondary-btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="primary-btn">Save</button>
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="skeleton-container">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && lectures.length === 0 && !showForm && (
          <div className="empty-state">
            <p>No classes scheduled for this date. Enjoy your day off!</p>
          </div>
        )}

        {!loading && !error && lectures.length > 0 && !showForm && (
          <div className="lecture-grid">
            {lectures.map((lecture) => (
              <div key={lecture.id} className="lecture-card touch-target">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="lecture-time">
                    {formatTime12Hour(lecture.startTime)} - {formatTime12Hour(lecture.endTime)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="secondary-btn small-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEdit(lecture)}>Edit</button>
                    <button className="danger-btn small-btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleDelete(lecture.id)}>Delete</button>
                  </div>
                </div>
                <div className="lecture-details">
                  <h3>{lecture.title}</h3>
                  <p className="lecture-meta">
                    <span className={`lecture-type ${lecture.type.toLowerCase()}`}>{lecture.type}</span> &bull; {lecture.room}
                  </p>
                  <p className="lecture-instructor">{lecture.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
