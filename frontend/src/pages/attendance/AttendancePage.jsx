import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    clockIn,
    clockOut,
    getMyAttendance,
    getAllAttendance,
} from '../../api/attendanceAPI';

const StatusBadge = ({ record }) => {
    if (!record.clock_in) {
        return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Absent</span>;
    }
    if (record.clock_in && !record.clock_out) {
        return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Clocked In</span>;
    }
    return <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Completed</span>;
};

const formatTime = (time) => {
    if (!time) return '—';
    return new Date(time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '—';
    const diff = new Date(clockOut) - new Date(clockIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const AttendancePage = () => {
    const { isAdminOrHR } = useAuth();

    const [view, setView] = useState('my');
    const [attendance, setAttendance] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [clockedIn, setClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const [clockMessage, setClockMessage] = useState({ type: '', text: '' });
    const [message, setMessage] = useState({ type: '', text: '' });

    // filters for admin view
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchAttendance = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (view === 'my') {
                res = await getMyAttendance({ page, limit: 10 });
            } else {
                res = await getAllAttendance({
                    page,
                    limit: 10,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                });
            }
            setAttendance(res.data.data || []);
            setMeta(res.data.meta || {});

            // check if clocked in today
            if (view === 'my') {
                const today = new Date().toISOString().split('T')[0];
                const todayRecord = res.data.data && res.data.data.find(r => {
                    const recordDate = new Date(r.clock_in || r.createdAt).toISOString().split('T')[0];
                    return recordDate === today;
                });
                if (todayRecord && todayRecord.clock_in && !todayRecord.clock_out) {
                    setClockedIn(true);
                } else {
                    setClockedIn(false);
                }
            }
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    }, [view, page, startDate, endDate]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleClock = async () => {
        setClockLoading(true);
        setClockMessage({ type: '', text: '' });
        try {
            if (clockedIn) {
                await clockOut();
                setClockedIn(false);
                setClockMessage({ type: 'success', text: 'Clocked out successfully!' });
            } else {
                await clockIn();
                setClockedIn(true);
                setClockMessage({ type: 'success', text: 'Clocked in successfully!' });
            }
            fetchAttendance();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Something went wrong';
            setClockMessage({ type: 'error', text: msg });
        } finally {
            setClockLoading(false);
        }
    };

    const handleFilter = (e) => {
        e.preventDefault();
        setPage(1);
    };

    return (
        <div className="space-y-4">

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Clock in/out card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Today's Attendance</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(new Date())}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={handleClock}
                            disabled={clockLoading}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition ${clockedIn
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                } disabled:opacity-50`}
                        >
                            {clockLoading ? 'Processing...' : clockedIn ? 'Clock Out' : 'Clock In'}
                        </button>
                        {clockMessage.text && (
                            <p className={`text-xs ${clockMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {clockMessage.text}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* View toggle — admin/hr only */}
            {isAdminOrHR && (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setView('my'); setPage(1); }}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Attendance
                    </button>
                    <button
                        onClick={() => { setView('all'); setPage(1); }}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        All Employees
                    </button>
                </div>
            )}

            {/* Date filter — admin/hr all view */}
            {isAdminOrHR && view === 'all' && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
                        >
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                        >
                            Clear
                        </button>
                    </form>
                </div>
            )}

            {/* Attendance table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                        No attendance records found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {view === 'all' && (
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    )}
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock In</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Out</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendance.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition">
                                        {view === 'all' && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {record.employee && record.employee.first_name && record.employee.first_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-xs">
                                                            {record.employee && `${record.employee.first_name} ${record.employee.last_name}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-gray-600">{formatDate(record.clock_in || record.createdAt)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatTime(record.clock_in)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatTime(record.clock_out)}</td>
                                        <td className="px-6 py-4 text-gray-600">{calculateHours(record.clock_in, record.clock_out)}</td>
                                        <td className="px-6 py-4"><StatusBadge record={record} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Page {meta.currentPage} of {meta.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === meta.totalPages}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AttendancePage;