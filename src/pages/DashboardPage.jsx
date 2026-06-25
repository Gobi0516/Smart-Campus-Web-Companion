import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTodayLectures } from '../services/api';

const DashboardPage = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLectures = async () => {
      try {
        setLoading(true);
        const data = await fetchTodayLectures();
        setLectures(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadLectures();
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Today's Schedule</h1>
          <p>Welcome back! Here are your lectures for today.</p>
        </div>
        {/* <Link to="/assignments" className="primary-btn" style={{ textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          View all
        </Link> */}
      </header>

      <main className="dashboard-main">
        {loading && (
          <div className="skeleton-container">
            <div className="skeleton-card"></div>
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

        {!loading && !error && lectures.length === 0 && (
          <div className="empty-state">
            <p>No lectures scheduled for today. Enjoy your day off!</p>
          </div>
        )}

        {!loading && !error && lectures.length > 0 && (
          <div className="lecture-grid">
            {lectures.map((lecture) => (
              <div key={lecture.id} className="lecture-card touch-target">
                <div className="lecture-time">{lecture.time}</div>
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
