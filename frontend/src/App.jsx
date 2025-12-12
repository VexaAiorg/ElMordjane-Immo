import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import DashboardLayout from './components/DashboardLayout';
import AllProperties from './pages/dashboard/AllProperties';
import SoldProperties from './pages/dashboard/SoldProperties';
import RentedProperties from './pages/dashboard/RentedProperties';
import Archives from './pages/dashboard/Archives';
import GestionCollaborateurs from './pages/dashboard/GestionCollaborateurs';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import PropertyWizard from './pages/dashboard/PropertyWizard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Redirect root to auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />

            {/* Public routes - redirect to dashboard if already authenticated */}
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="menu" replace />} />
              <Route path="menu" element={<AllProperties />} />
              <Route path="vente" element={<SoldProperties />} />
              <Route path="location" element={<RentedProperties />} />
              <Route path="archives" element={<Archives />} />
              <Route path="collaborateurs" element={<GestionCollaborateurs />} />
              <Route path="wizard" element={<PropertyWizard />} />
              <Route path="wizard/:step" element={<PropertyWizard />} />
              <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Catch all - redirect to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
