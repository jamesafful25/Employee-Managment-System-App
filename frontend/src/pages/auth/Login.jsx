import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.post('/auth/login', formData);
            const { token, data } = response.data;
            login(data, token);
            if (!data.is_password_changed) {
                navigate('/change-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const message =
                err.response && err.response.data && err.response.data.message
                    ? err.response.data.message
                    : 'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* Left side — branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex-col items-center justify-center p-12 relative overflow-hidden">

                {/* Background circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white opacity-5 rounded-full"></div>

                {/* Content */}
                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3">EMS Portal</h1>
                    <p className="text-blue-100 text-lg mb-8">Employee Management System</p>

                    <div className="space-y-4 text-left">
                        {[
                            {  text: 'Manage your workforce efficiently' },
                            {  text: 'Track attendance and performance' },
                            {  text: 'Streamline payroll processing' },
                            {  text: 'Handle leave management easily' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-white">
                                <span className="text-xl">{item.icon}</span>
                                <p className="text-sm text-blue-100">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom text */}
                <p className="absolute bottom-6 text-blue-200 text-xs">
                    Eumes Co. Ltd © {new Date().getFullYear()}
                </p>
            </div>

            {/* Right side — login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">EMS Portal</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
                        <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
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
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@company.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                                        Forgot password?
                                    </a>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition text-sm"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        Employee Management System • Eumes Co. Ltd
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Login;