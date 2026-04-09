import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const ProfilePage = () => {
    const { employee: authEmployee } = useAuth();
    const [employee, setEmployee] = useState(authEmployee);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        axiosInstance.get('/auth/me')
            .then(res => {
                if (res.data && res.data.data) {
                    setEmployee(res.data.data);
                } else {
                    setEmployee(authEmployee);
                }
            })
            .catch(() => {
                setEmployee(authEmployee);
            });
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handlePasswordChange = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            showMessage('error', 'Please fill in all fields');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        setPasswordLoading(true);
        try {
            await axiosInstance.patch('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setMessage({ type: 'success', text: 'Password changed successfully! Redirecting to login...' });
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('employee');
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to change password';
            showMessage('error', msg);
        } finally {
            setPasswordLoading(false);
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-700',
            hr: 'bg-blue-100 text-blue-700',
            manager: 'bg-yellow-100 text-yellow-700',
            employee: 'bg-gray-100 text-gray-700',
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    if (!employee) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-2xl space-y-4">

            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                        {employee.first_name && employee.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {employee.first_name} {employee.last_name}
                        </h2>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${getRoleColor(employee.role)}`}>
                                {employee.role}
                            </span>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${employee.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {employee.is_active == 1 ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition ${activeTab === 'profile'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    My Info
                </button>
                <button
                    onClick={() => setActiveTab('password')}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition ${activeTab === 'password'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    Change Password
                </button>
            </div>

            {/* My Info tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">First Name</p>
                            <p className="text-sm text-gray-900">{employee.first_name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Last Name</p>
                            <p className="text-sm text-gray-900">{employee.last_name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                            <p className="text-sm text-gray-900">{employee.email || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                            <p className="text-sm text-gray-900">{employee.phone || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Position</p>
                            <p className="text-sm text-gray-900">{employee.position || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Role</p>
                            <p className="text-sm text-gray-900 capitalize">{employee.role || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Basic Salary</p>
                            <p className="text-sm text-gray-900">
                                {employee.basic_salary
                                    ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(employee.basic_salary)
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Department</p>
                            <p className="text-sm text-gray-900">
                                {employee.department ? employee.department.name : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Hire Date</p>
                            <p className="text-sm text-gray-900">
                                {employee.hire_date
                                    ? new Date(employee.hire_date).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Member Since</p>
                            <p className="text-sm text-gray-900">
                                {employee.createdAt
                                    ? new Date(employee.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                            To update your personal information, contact your HR or Admin.
                        </p>
                    </div>
                </div>
            )}

            {/* Change Password tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter your current password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min 8 chars, uppercase, number, special char"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Repeat your new password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700 font-medium mb-1">Password requirements:</p>
                            <ul className="text-xs text-blue-600 space-y-0.5">
                                <li>At least 8 characters long</li>
                                <li>At least one uppercase letter (A-Z)</li>
                                <li>At least one lowercase letter (a-z)</li>
                                <li>At least one number (0-9)</li>
                                <li>At least one special character (@$!%*?&)</li>
                            </ul>
                        </div>
                        <button
                            type="button"
                            onClick={handlePasswordChange}
                            disabled={passwordLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition text-sm"
                        >
                            {passwordLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProfilePage;