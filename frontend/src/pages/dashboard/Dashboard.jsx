import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllEmployees } from '../../api/employeeAPI';
import { getMyAttendance, clockIn, clockOut } from '../../api/attendanceAPI';
import { getMyLeaves, getLeaveBalance } from '../../api/leaveAPI';
import { getAllDepartments } from '../../api/departmentAPI';
import { getAllPayroll } from '../../api/payrollAPI';

const StatCard = ({ title, value, subtitle, icon, bgColor, iconBg, valueColor }) => (
    <div className={`rounded-xl p-5 ${bgColor || 'bg-white border border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white uppercase tracking-wider opacity-80">{title}</p>
            {icon && (
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg || 'bg-white bg-opacity-20'}`}>
                    {icon}
                </div>
            )}
        </div>
        <p className={`text-2xl font-bold ${valueColor || 'text-white'}`}>{value}</p>
        {subtitle && <p className="text-xs mt-1 text-white opacity-70">{subtitle}</p>}
    </div>
);

const LeaveCard = ({ title, value, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

const Dashboard = () => {
    const { employee, isAdminOrHR } = useAuth();
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalDepartments, setTotalDepartments] = useState(0);
    const [totalPayroll, setTotalPayroll] = useState(0);
    const [avgSalary, setAvgSalary] = useState(0);
    const [leaveBalance, setLeaveBalance] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [clockedIn, setClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const [clockMessage, setClockMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const balanceRes = await getLeaveBalance();
                setLeaveBalance(balanceRes.data.data || []);

                const leavesRes = await getMyLeaves({ limit: 5 });
                setRecentLeaves(leavesRes.data.data || []);

                const today = new Date().toISOString().split('T')[0];
                const attendanceRes = await getMyAttendance({ date: today });
                const todayRecord = attendanceRes.data.data && attendanceRes.data.data[0];
                if (todayRecord && todayRecord.clock_in && !todayRecord.clock_out) {
                    setClockedIn(true);
                }

                if (isAdminOrHR) {
                    const empRes = await getAllEmployees();
                    const meta = empRes.data.meta;
                    setTotalEmployees(meta ? meta.total : empRes.data.data.length);

                    const deptRes = await getAllDepartments();
                    setTotalDepartments(deptRes.data.data ? deptRes.data.data.length : 0);

                    const payrollRes = await getAllPayroll({ page: 1, limit: 100 });
                    const payrolls = payrollRes.data.data || [];
                    const now = new Date();
                    const currentMonth = now.getMonth() + 1;
                    const currentYear = now.getFullYear();
                    const thisMonthPayrolls = payrolls.filter(
                        p => p.month === currentMonth && p.year === currentYear
                    );
                    const total = thisMonthPayrolls.reduce(
                        (sum, p) => sum + parseFloat(p.net_salary || 0), 0
                    );
                    const avg = thisMonthPayrolls.length > 0 ? total / thisMonthPayrolls.length : 0;
                    setTotalPayroll(total);
                    setAvgSalary(avg);
                }
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAdminOrHR]);

    const handleClock = async () => {
        setClockLoading(true);
        setClockMessage('');
        try {
            if (clockedIn) {
                await clockOut();
                setClockedIn(false);
                setClockMessage('Clocked out successfully!');
            } else {
                await clockIn();
                setClockedIn(true);
                setClockMessage('Clocked in successfully!');
            }
        } catch (err) {
            const message = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Something went wrong';
            setClockMessage(message);
        } finally {
            setClockLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatusColor = (status) => {
        if (status === 'approved') return 'bg-green-100 text-green-700';
        if (status === 'rejected') return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GH', {
            style: 'currency',
            currency: 'GHS',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Greeting card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {getGreeting()}, {employee && employee.first_name}! 👋
                        </h2>
                        <p className="text-blue-100 mt-1 text-sm">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleClock}
                            disabled={clockLoading}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm ${clockedIn
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-white text-blue-600 hover:bg-blue-50'
                                } disabled:opacity-50`}
                        >
                            {clockLoading ? 'Processing...' : clockedIn ? '🔴 Clock Out' : '🟢 Clock In'}
                        </button>
                        {clockMessage && (
                            <p className="text-xs text-blue-100">{clockMessage}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin stat cards */}
            {isAdminOrHR && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Employees"
                        value={totalEmployees}
                        subtitle="Active staff members"
                        bgColor="bg-blue-600"
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Departments"
                        value={totalDepartments}
                        subtitle="Active departments"
                        bgColor="bg-purple-600"
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Total Payroll"
                        value={totalPayroll > 0 ? formatCurrency(totalPayroll) : 'Not generated'}
                        subtitle={totalPayroll > 0
                            ? `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`
                            : 'Go to Payroll to generate'}
                        bgColor="bg-emerald-600"
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatCard
                        title="Average Salary"
                        value={avgSalary > 0 ? formatCurrency(avgSalary) : 'N/A'}
                        subtitle="Per employee this month"
                        bgColor="bg-orange-500"
                        icon={
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                    />
                </div>
            )}

            {/* Leave balance */}
            {leaveBalance.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">My Leave Balance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {leaveBalance.map((balance) => (
                            <LeaveCard
                                key={balance.leave_type_id}
                                title={balance.leaveType && balance.leaveType.name}
                                value={`${balance.remaining_days} days`}
                                subtitle={`Used ${balance.used_days} of ${balance.total_days} days`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recent leaves */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Recent Leave Applications</h3>
                </div>
                {recentLeaves.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-gray-400">
                        No leave applications yet
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentLeaves.map((leave) => (
                            <div key={leave.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {leave.leaveType && leave.leaveType.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(leave.start_date).toLocaleDateString()} —{' '}
                                        {new Date(leave.end_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusColor(leave.status)}`}>
                                    {leave.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Dashboard;