import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axiosInstance.post('/auth/reset-password', {
                token,
                newPassword: formData.newPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to reset password. The link may have expired.';
            setError(msg);
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter your new password below
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">Password Reset!</h3>
                            <p className="text-sm text-gray-500">
                                Your password has been reset successfully. Redirecting to login...
                            </p>
                            <Link
                                to="/login"
                                className="inline-block text-sm text-blue-600 hover:underline"
                            >
                                Go to login now
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {!token ? (
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-4">
                                        No reset token found. Please request a new password reset.
                                    </p>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Request password reset
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            required
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Min 8 characters"
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
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Repeat your new password"
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                                        />
                                    </div>

                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <p className="text-xs text-orange-700 font-medium mb-1">Password requirements:</p>
                                        <ul className="text-xs text-orange-600 space-y-0.5">
                                            <li>At least 8 characters long</li>
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
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default ResetPassword;