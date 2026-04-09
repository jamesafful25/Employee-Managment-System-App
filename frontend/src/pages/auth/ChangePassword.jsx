import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const ChangePassword = () => {
    const navigate = useNavigate();
    const { employee, login, token } = useAuth();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // if already changed password — redirect to dashboard
    useEffect(() => {
        if (employee && employee.is_password_changed) {
            navigate('/dashboard');
        }
    }, [employee]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New password and confirm password do not match');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.patch('/auth/change-password', formData);
            const updatedEmployee = { ...employee, is_password_changed: true };
            login(updatedEmployee, token);
            navigate('/dashboard');
        } catch (err) {
            const message =
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Failed to change password';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Change Your Password</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        You must change your temporary password before continuing
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Temporary Password
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                placeholder="Enter your temporary password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                placeholder="Min 8 chars, uppercase, number, special char"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="Repeat your new password"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs text-orange-700 font-medium mb-1">Password requirements:</p>
                            <ul className="text-xs text-orange-600 space-y-0.5">
                                <li>At least 8 characters</li>
                                <li>At least one uppercase letter (A-Z)</li>
                                <li>At least one lowercase letter (a-z)</li>
                                <li>At least one number (0-9)</li>
                                <li>At least one special character (@$!%*?&)</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2.5 rounded-lg transition text-sm"
                        >
                            {loading ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Employee Management System
                </p>
            </div>
        </div>
    );
};

export default ChangePassword;