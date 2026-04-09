import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from '../../api/leaveTypeAPI';

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

const LeaveTypePage = () => {
    const navigate = useNavigate();
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({ name: '', max_days: '' });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchLeaveTypes = async () => {
        setLoading(true);
        try {
            const res = await getAllLeaveTypes();
            setLeaveTypes(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch leave types:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await createLeaveType(formData);
            setShowAddModal(false);
            setFormData({ name: '', max_days: '' });
            showMessage('success', 'Leave type created successfully');
            fetchLeaveTypes();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to create leave type';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await updateLeaveType(selected.id, formData);
            setShowEditModal(false);
            showMessage('success', 'Leave type updated successfully');
            fetchLeaveTypes();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to update leave type';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            await deleteLeaveType(selected.id);
            setShowDeleteModal(false);
            showMessage('success', 'Leave type deleted successfully');
            fetchLeaveTypes();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to delete leave type';
            showMessage('error', msg);
            setShowDeleteModal(false);
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-4">

            {/* Back button */}
            <button
                onClick={() => navigate('/leaves')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Leaves
            </button>

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{leaveTypes.length} leave types</p>
                <button
                    onClick={() => { setFormData({ name: '', max_days: '' }); setFormError(''); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Leave Type
                </button>
            </div>

            {/* Leave types table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : leaveTypes.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                        No leave types yet. Create your first one!
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Days</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaveTypes.map(lt => (
                                <tr key={lt.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{lt.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{lt.max_days} days</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setSelected(lt); setFormData({ name: lt.name, max_days: lt.max_days }); setFormError(''); setShowEditModal(true); }}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { setSelected(lt); setShowDeleteModal(true); }}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <Modal title="Add Leave Type" onClose={() => setShowAddModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Annual Leave, Sick Leave"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Days per Year</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.max_days}
                                onChange={(e) => setFormData({ ...formData, max_days: e.target.value })}
                                placeholder="e.g. 21"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition">
                                {formLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Modal */}
            {showEditModal && selected && (
                <Modal title="Edit Leave Type" onClose={() => setShowEditModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{formError}</div>
                    )}
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Max Days per Year</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.max_days}
                                onChange={(e) => setFormData({ ...formData, max_days: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition">
                                {formLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selected && (
                <Modal title="Delete Leave Type" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{selected.name}</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleDelete} disabled={formLoading} className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition">
                                {formLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default LeaveTypePage;