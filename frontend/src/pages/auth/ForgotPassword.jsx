import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">Check your email</h3>
                            <p className="text-sm text-gray-500">
                                We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>.
                                The link expires in 15 minutes.
                            </p>
                            <p className="text-xs text-gray-400">
                                Didn't receive it? Check your spam folder.
                            </p>
                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Try a different email
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition text-sm"
                                >
                                    {loading ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
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

export default ForgotPassword;
