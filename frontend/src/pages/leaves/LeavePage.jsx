import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveBalance,
    approveLeave,
    rejectLeave,
    cancelLeave,
} from '../../api/leaveAPI';
import { getAllLeaveTypes } from '../../api/leaveTypeAPI';

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        cancelled: 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="px-6 py-4">{children}</div>
        </div>
    </div>
);

const LeavePage = () => {
    const { isAdminOrHR, isManager, isAdmin, employee } = useAuth();
    const navigate = useNavigate();
    const canManage = isAdminOrHR || isManager;

    const [view, setView] = useState('my');
    const [leaves, setLeaves] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    // apply leave modal
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [applyForm, setApplyForm] = useState({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: '',
    });
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyError, setApplyError] = useState('');

    // filters
    const [statusFilter, setStatusFilter] = useState('');

    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (view === 'my') {
                res = await getMyLeaves({ page, limit: 10 });
            } else {
                res = await getAllLeaves({
                    page,
                    limit: 10,
                    ...(statusFilter && { status: statusFilter }),
                });
            }
            setLeaves(res.data.data || []);
            setMeta(res.data.meta || {});

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
            console.error('Failed to fetch leaves:', err);
        } finally {
            setLoading(false);
        }
    }, [view, page, statusFilter]);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    useEffect(() => {
        getLeaveBalance().then(res => setLeaveBalance(res.data.data || []));
        getAllLeaveTypes().then(res => {
            console.log('Leave types response:', res.data);
            const types = res.data.data || res.data || [];
            console.log('Leave types array:', types);
            setLeaveTypes(Array.isArray(types) ? types : []);
        });
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setApplyLoading(true);
        setApplyError('');
        try {
            await applyLeave(applyForm);
            setShowApplyModal(false);
            setApplyForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
            showMessage('success', 'Leave application submitted successfully');
            fetchLeaves();
            getLeaveBalance().then(res => setLeaveBalance(res.data.data || []));
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to apply for leave';
            setApplyError(msg);
        } finally {
            setApplyLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveLeave(id);
            showMessage('success', 'Leave approved successfully');
            fetchLeaves();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to approve leave';
            showMessage('error', msg);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectLeave(id);
            showMessage('success', 'Leave rejected');
            fetchLeaves();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to reject leave';
            showMessage('error', msg);
        }
    };

    const handleCancel = async (id) => {
        try {
            await cancelLeave(id);
            showMessage('success', 'Leave cancelled successfully');
            fetchLeaves();
            getLeaveBalance().then(res => setLeaveBalance(res.data.data || []));
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to cancel leave';
            showMessage('error', msg);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    return (
        <div className="space-y-4">

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Leave balance cards */}
            {view === 'my' && leaveBalance.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {leaveBalance.map(balance => (
                        <div key={balance.leave_type_id} className="bg-white rounded-xl border border-gray-200 p-4">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                                {balance.leaveType && balance.leaveType.name}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">{balance.remaining_days}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                of {balance.total_days} days remaining
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Header actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setView('my'); setPage(1); }}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Leaves
                    </button>
                    {canManage && (
                        <button
                            onClick={() => { setView('all'); setPage(1); }}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Leaves
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/leaves/types')}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                        >
                            Manage Leave Types
                        </button>
                    )}
                    <button
                        onClick={() => { setApplyError(''); setShowApplyModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Apply Leave
                    </button>
                </div>
            </div>

            {/* Status filter — all view */}
            {canManage && view === 'all' && (
                <div className="flex gap-2 flex-wrap">
                    {['', 'pending', 'approved', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition capitalize ${statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status === '' ? 'All' : status}
                        </button>
                    ))}
                </div>
            )}

            {/* Leaves table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                        No leave applications found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {view === 'all' && (
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    )}
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">End</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leaves.map(leave => (
                                    <tr key={leave.id} className="hover:bg-gray-50 transition">
                                        {view === 'all' && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                                        {leave.employee && leave.employee.first_name && leave.employee.first_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-900">
                                                        {leave.employee && `${leave.employee.first_name} ${leave.employee.last_name}`}
                                                    </p>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-gray-700 font-medium">
                                            {leave.leaveType && leave.leaveType.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(leave.start_date)}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(leave.end_date)}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {leave.reason || '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={leave.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                {/* Cancel — own pending leave */}
                                                {view === 'my' && leave.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancel(leave.id)}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                {/* Approve/Reject — admin/hr/manager */}
                                                {canManage && leave.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(leave.id)}
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(leave.id)}
                                                            className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
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

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <Modal title="Apply for Leave" onClose={() => setShowApplyModal(false)}>
                    {applyError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {applyError}
                        </div>
                    )}
                    {leaveTypes.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                            No leave types available. Ask admin to create leave types first.
                        </div>
                    ) : (
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Leave Type</label>
                                <select
                                    required
                                    value={applyForm.leave_type_id}
                                    onChange={(e) => setApplyForm({ ...applyForm, leave_type_id: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select leave type...</option>
                                    {leaveTypes.map(lt => (
                                        <option key={lt.id} value={lt.id}>{lt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={applyForm.start_date}
                                        onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={applyForm.end_date}
                                        onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Reason <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={applyForm.reason}
                                    onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                                    placeholder="Briefly explain the reason for your leave..."
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={applyLoading}
                                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                                >
                                    {applyLoading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            )}

        </div>
    );
};

export default LeavePage;