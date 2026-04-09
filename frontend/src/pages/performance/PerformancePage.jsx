import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getMyPerformance,
    getAllPerformance,
    createReview,
    updateReview,
    deleteReview,
} from '../../api/performanceAPI';
import { getAllEmployees } from '../../api/employeeAPI';

const StarRating = ({ rating, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange && onChange(star)}
                    onMouseEnter={() => onChange && setHovered(star)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    className={`text-2xl transition ${star <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-200'
                        } ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    ★
                </button>
            ))}
        </div>
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

const PerformancePage = () => {
    const { isAdmin, isAdminOrHR, isManager, employee: currentUser } = useAuth();
    const canManage = isAdminOrHR || isManager;

    const [view, setView] = useState('my');
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        employee_id: '',
        rating: 0,
        comments: '',
        goals: '',
        review_date: new Date().toISOString().split('T')[0],
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [editForm, setEditForm] = useState({ rating: 0, comments: '', goals: '', review_date: '' });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (view === 'my') {
                res = await getMyPerformance({ page, limit: 10 });
                setAverageRating(res.data.averageRating || 0);
            } else {
                res = await getAllPerformance({ page, limit: 10 });
                setAverageRating(0);
            }
            setReviews(res.data.data || []);
            setMeta(res.data.meta || {});
        } catch (err) {
            console.error('Failed to fetch performance:', err);
        } finally {
            setLoading(false);
        }
    }, [view, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        if (canManage) {
            getAllEmployees({ limit: 100 }).then(res => {
                setEmployees(res.data.data || []);
            });
        }
    }, [canManage]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (createForm.rating === 0) { setCreateError('Please select a rating'); return; }
        setCreateLoading(true);
        setCreateError('');
        try {
            await createReview(createForm);
            setShowCreateModal(false);
            setCreateForm({ employee_id: '', rating: 0, comments: '', goals: '', review_date: new Date().toISOString().split('T')[0] });
            showMessage('success', 'Performance review created successfully');
            fetchReviews();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to create review';
            setCreateError(msg);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        try {
            await updateReview(selectedReview.id, editForm);
            setShowEditModal(false);
            showMessage('success', 'Review updated successfully');
            fetchReviews();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to update review';
            setEditError(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteReview(selectedReview.id);
            setShowDeleteModal(false);
            showMessage('success', 'Review deleted successfully');
            fetchReviews();
        } catch (err) {
            showMessage('error', 'Failed to delete review');
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-4">

            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Average rating card */}
            {view === 'my' && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">My Average Rating</p>
                            <div className="flex items-center gap-3">
                                <StarRating rating={Math.round(averageRating)} />
                                <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
                                <span className="text-sm text-gray-400">/ 5.0</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
                            <span className="text-3xl">⭐</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setView('my'); setPage(1); }}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Reviews
                    </button>
                    {canManage && (
                        <button
                            onClick={() => { setView('all'); setPage(1); }}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Reviews
                        </button>
                    )}
                </div>
                {canManage && (
                    <button
                        onClick={() => { setCreateError(''); setCreateForm({ employee_id: '', rating: 0, comments: '', goals: '', review_date: new Date().toISOString().split('T')[0] }); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Review
                    </button>
                )}
            </div>

            {/* Reviews content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">No performance reviews found</div>
                ) : view === 'all' ? (
                    // Card layout for All Reviews
                    <div className="divide-y divide-gray-100">
                        {reviews.map(review => (
                            <div key={review.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {review.employee && review.employee.first_name && review.employee.first_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {review.employee && `${review.employee.first_name} ${review.employee.last_name}`}
                                            </p>
                                            <p className="text-xs text-gray-400">{review.employee && review.employee.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} />
                                        <span className="text-xs text-gray-400">{review.rating}/5</span>
                                    </div>
                                </div>
                                {(review.comments || review.goals) && (
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {review.comments && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-0.5">Comments</p>
                                                <p className="text-xs text-gray-600">{review.comments}</p>
                                            </div>
                                        )}
                                        {review.goals && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-0.5">Goals</p>
                                                <p className="text-xs text-gray-600">{review.goals}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs text-gray-400">
                                            By <span className="text-gray-600 font-medium">
                                                {review.reviewer && `${review.reviewer.first_name} ${review.reviewer.last_name}`}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400">{formatDate(review.review_date)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedReview(review);
                                                setEditForm({
                                                    rating: review.rating,
                                                    comments: review.comments || '',
                                                    goals: review.goals || '',
                                                    review_date: review.review_date ? review.review_date.split('T')[0] : '',
                                                });
                                                setEditError('');
                                                setShowEditModal(true);
                                            }}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                        >
                                            Edit
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => { setSelectedReview(review); setShowDeleteModal(true); }}
                                                className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Table layout for My Reviews
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Goals</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Reviewed By</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {reviews.map(review => (
                                    <tr key={review.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-4">
                                            <StarRating rating={review.rating} />
                                            <p className="text-xs text-gray-400 mt-0.5">{review.rating}/5</p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">
                                            <p className="max-w-[200px] truncate text-xs">{review.comments || '—'}</p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 hidden md:table-cell">
                                            <p className="max-w-[180px] truncate text-xs">{review.goals || '—'}</p>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600 text-xs hidden md:table-cell">
                                            {review.reviewer && `${review.reviewer.first_name} ${review.reviewer.last_name}`}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 text-xs">
                                            {formatDate(review.review_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {meta && meta.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">Page {meta.currentPage} of {meta.totalPages}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">Previous</button>
                            <button onClick={() => setPage(page + 1)} disabled={page === meta.totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Review Modal */}
            {showCreateModal && (
                <Modal title="Add Performance Review" onClose={() => setShowCreateModal(false)}>
                    {createError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{createError}</div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                            <select
                                required
                                value={createForm.employee_id}
                                onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select employee...</option>
                                {employees.filter(emp => emp.id !== currentUser.id).map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name} — {emp.position || emp.role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Rating</label>
                            <StarRating rating={createForm.rating} onChange={(r) => setCreateForm({ ...createForm, rating: r })} />
                            <p className="text-xs text-gray-400 mt-1">{createForm.rating > 0 ? `${createForm.rating} out of 5` : 'Click to rate'}</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                            <textarea rows={3} value={createForm.comments} onChange={(e) => setCreateForm({ ...createForm, comments: e.target.value })} placeholder="Write your review comments..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Goals</label>
                            <textarea rows={2} value={createForm.goals} onChange={(e) => setCreateForm({ ...createForm, goals: e.target.value })} placeholder="Set goals for next review period..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Review Date</label>
                            <input type="date" value={createForm.review_date} onChange={(e) => setCreateForm({ ...createForm, review_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" disabled={createLoading} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition">
                                {createLoading ? 'Saving...' : 'Save Review'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Review Modal */}
            {showEditModal && selectedReview && (
                <Modal title="Edit Review" onClose={() => setShowEditModal(false)}>
                    {editError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{editError}</div>
                    )}
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Rating</label>
                            <StarRating rating={editForm.rating} onChange={(r) => setEditForm({ ...editForm, rating: r })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                            <textarea rows={3} value={editForm.comments} onChange={(e) => setEditForm({ ...editForm, comments: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Goals</label>
                            <textarea rows={2} value={editForm.goals} onChange={(e) => setEditForm({ ...editForm, goals: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Review Date</label>
                            <input type="date" value={editForm.review_date} onChange={(e) => setEditForm({ ...editForm, review_date: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" disabled={editLoading} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition">
                                {editLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedReview && (
                <Modal title="Delete Review" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Are you sure you want to delete this review? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default PerformancePage;