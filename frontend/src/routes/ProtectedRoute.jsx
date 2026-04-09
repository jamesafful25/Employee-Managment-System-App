import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { employee, loading } = useAuth();

    // wait for auth context to finish loading
    if (loading) return null;

    // Not logged in — send to login page
    if (!employee) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but wrong role — send to dashboard
    if (roles && !roles.includes(employee.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // All good — render the page
    return children;
};

export default ProtectedRoute;