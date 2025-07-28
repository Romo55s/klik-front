import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { Navigation } from './components/Navigation';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { CardClaim } from './components/CardClaim';
import { AdminPanel } from './components/AdminPanel';
import './App.css';

function App() {
  const { isAuthenticated, userData } = useAuth();
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/profile/:username" 
              element={<Profile />} 
            />
            <Route 
              path="/profile/:username/claim" 
              element={
                <ProtectedRoute>
                  <CardClaim />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  {userData ? (
                    userData.user.role === 'admin' ? (
                      <Navigate to="/admin" replace />
                    ) : (
                      <Navigate to={`/profile/${userData.user.username}`} replace />
                    )
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Wrap the App with AuthProvider
export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
