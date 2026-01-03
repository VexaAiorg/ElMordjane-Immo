import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import AllProperties from './pages/dashboard/AllProperties';
import SoldProperties from './pages/dashboard/SoldProperties';
import RentedProperties from './pages/dashboard/RentedProperties';
import Archives from './pages/dashboard/Archives';
import Corbeille from './pages/dashboard/Corbeille';
import GestionCollaborateurs from './pages/dashboard/GestionCollaborateurs';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import PropertyWizard from './pages/dashboard/PropertyWizard';
import Demande from './pages/dashboard/Demande';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard/menu" replace />} />
                <Route path="menu" element={<AllProperties />} />
                <Route path="vente" element={<SoldProperties />} />
                <Route path="location" element={<RentedProperties />} />
                <Route path="archives" element={
                    <ProtectedRoute adminOnly>
                        <Archives />
                    </ProtectedRoute>
                } />
                <Route path="corbeille" element={
                    <ProtectedRoute adminOnly>
                        <Corbeille />
                    </ProtectedRoute>
                } />
                <Route path="demandes" element={
                    <ProtectedRoute adminOnly>
                        <Demande />
                    </ProtectedRoute>
                } />
                <Route path="collaborateurs" element={
                    <ProtectedRoute adminOnly>
                        <GestionCollaborateurs />
                    </ProtectedRoute>
                } />
                <Route path="wizard" element={<PropertyWizard />} />
                <Route path="wizard/:step" element={<PropertyWizard />} />
                <Route path="profile" element={<ProfileSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard/menu" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
