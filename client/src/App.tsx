import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Admin Dashboard component
 * Displays the main interface for administrators
 */
const AdminDashboard: React.FC = () => (
  <div className="p-4 space-y-4">
    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
    <div className="bg-white rounded-lg shadow p-6">
      {/* Admin content will be added here */}
      <p className="text-gray-600">Welcome to the admin dashboard</p>
    </div>
  </div>
);

/**
 * User Dashboard component
 * Displays the main interface for regular users
 */
const UserDashboard: React.FC = () => (
  <div className="p-4 space-y-4">
    <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
    <div className="bg-white rounded-lg shadow p-6">
      {/* User content will be added here */}
      <p className="text-gray-600">Welcome to your store dashboard</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;