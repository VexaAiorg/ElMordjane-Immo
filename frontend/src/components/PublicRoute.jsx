import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/api';

/**
 * PublicRoute component - Prevents authenticated users from accessing auth pages
 * Redirects to /dashboard if user is already authenticated
 * This prevents the back button from taking logged-in users back to login/signup
 */
const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default PublicRoute;
