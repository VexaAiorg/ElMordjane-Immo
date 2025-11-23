import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/api';

/**
 * ProtectedRoute component - Protects routes that require authentication
 * Redirects to /auth if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
