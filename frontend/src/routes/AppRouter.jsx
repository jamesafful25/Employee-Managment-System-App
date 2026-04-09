import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import ChangePassword from '../pages/auth/ChangePassword';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// App pages 
import Dashboard from '../pages/dashboard/Dashboard';
import EmployeeList from '../pages/employees/EmployeeList';
import EmployeeDetail from '../pages/employees/EmployeeDetail';
import DepartmentList from '../pages/departments/DepartmentList';
import AttendancePage from '../pages/attendance/AttendancePage';
import LeavePage from '../pages/leaves/LeavePage';
import LeaveTypePage from '../pages/leaves/LeaveTypePage';
import PayrollPage from '../pages/payroll/PayrollPage';
import PerformancePage from '../pages/performance/PerformancePage';
import ProfilePage from '../pages/profile/ProfilePage';
import Layout from '../components/layout/Layout';
import ReportsPage from '../pages/reports/ReportsPage';
import UploadsPage from '../pages/uploads/UploadsPage';

const AppRouter = () => {
    const { employee, loading } = useAuth();

    if (loading) return null;

    return (
        <BrowserRouter>
            <Routes>

                {/* Public login route */}
                <Route
                    path="/login"
                    element={
                        !employee ? (
                            <Login />
                        ) : employee.is_password_changed ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <Navigate to="/change-password" replace />
                        )
                    }
                />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected layout routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="leaves" element={<LeavePage />} />

                    <Route
                        path="leaves/types"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <LeaveTypePage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="performance" element={<PerformancePage />} />
                    <Route path="payroll" element={<PayrollPage />} />

                    <Route
                        path="employees"
                        element={
                            <ProtectedRoute roles={['admin', 'hr']}>
                                <EmployeeList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="employees/:id"
                        element={
                            <ProtectedRoute roles={['admin', 'hr']}>
                                <EmployeeDetail />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="departments"
                        element={
                            <ProtectedRoute roles={['admin', 'hr']}>
                                <DepartmentList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="reports"
                        element={
                            <ProtectedRoute roles={['admin', 'hr']}>
                                <ReportsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="uploads"
                        element={
                            <ProtectedRoute roles={['admin', 'hr', 'manager']}>
                                <UploadsPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Change password route */}
                <Route
                    path="/change-password"
                    element={
                        employee ? (
                            <ChangePassword />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;