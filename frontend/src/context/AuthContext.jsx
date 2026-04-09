import { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

// Create the context
const AuthContext = createContext(null);

// AuthProvider wraps your whole app and shares auth state everywhere
export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // When the app first loads, check if there's already a session saved
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedEmployee = localStorage.getItem('employee');

        if (savedToken && savedEmployee) {
            setToken(savedToken);
            setEmployee(JSON.parse(savedEmployee));
        }
        setLoading(false);
    }, []);

    // Called after a successful login
    const login = (employeeData, jwtToken) => {
        setEmployee(employeeData);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('employee', JSON.stringify(employeeData));
    };

    // Called when the employee logs out
    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (err) {
            // even if the API call fails, we still clear local session
            console.error('Logout error:', err);
        } finally {
            setEmployee(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('employee');
            window.location.href = '/login';
        }
    };

    // Helper — check if logged in employee is admin or hr
    const isAdminOrHR = employee && (employee.role === 'admin' || employee.role === 'hr');

    // Helper — check if logged in employee is admin
    const isAdmin = employee && employee.role === 'admin';

    // Helper — check if logged in employee is a manager
    const isManager = employee && employee.role === 'manager';

    const value = {
        employee,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isAdminOrHR,
        isManager,
    };

    // Don't render anything until we've checked localStorage
    if (loading) return null;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook — lets any component access auth with one line
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
};

export default AuthContext;