import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AssignmentDetailPage from './pages/AssignmentDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          {/* Detail page outside the Layout so it doesn't have bottom navigation, or we could put it inside. Based on usual UX, detail pages hide the bottom tab or keep it. Since the prompt asks to implement this navigation, I'll put it inside the layout for consistency, or we can just leave it in the layout. Actually let's put it inside since there's no reason not to. */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
             <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
