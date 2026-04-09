import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getMyPayroll,
    getAllPayroll,
    generatePayroll,
    updatePayroll,
    markAsPaid,
} from '../../api/payrollAPI';

const StatusBadge = ({ status }) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-700',
        processed: 'bg-blue-100 text-blue-700',
        paid: 'bg-green-100 text-green-700',
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

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
    }).format(amount || 0);
};

const PayrollPage = () => {
    const { isAdminOrHR } = useAuth();

    const [view, setView] = useState('my');
    const [payrolls, setPayrolls] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    // generate payroll modal
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateForm, setGenerateForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [generateLoading, setGenerateLoading] = useState(false);
    const [generateError, setGenerateError] = useState('');

    // edit payroll modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [editForm, setEditForm] = useState({
        bonus: '',
        deductions: '',
        basic_salary: '',
        tax_rate: '',
        tax_method: 'basic',
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');

    const fetchPayroll = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (view === 'my') {
                res = await getMyPayroll({ page, limit: 10 });
            } else {
                res = await getAllPayroll({ page, limit: 10 });
            }
            setPayrolls(res.data.data || []);
            setMeta(res.data.meta || {});
        } catch (err) {
            console.error('Failed to fetch payroll:', err);
        } finally {
            setLoading(false);
        }
    }, [view, page]);

    useEffect(() => {
        fetchPayroll();
    }, [fetchPayroll]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerateLoading(true);
        setGenerateError('');
        try {
            await generatePayroll(generateForm);
            setShowGenerateModal(false);
            showMessage('success', `Payroll generated for ${MONTHS[generateForm.month - 1]} ${generateForm.year}`);
            fetchPayroll();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to generate payroll';
            setGenerateError(msg);
        } finally {
            setGenerateLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError('');
        try {
            await updatePayroll(selectedPayroll.id, {
                basic_salary: parseFloat(editForm.basic_salary) || 0,
                bonus: parseFloat(editForm.bonus) || 0,
                deductions: parseFloat(editForm.deductions) || 0,
                tax_rate: parseFloat(editForm.tax_rate) || 0,
                tax_method: editForm.tax_method,
            });
            setShowEditModal(false);
            showMessage('success', 'Payroll updated successfully');
            fetchPayroll();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to update payroll';
            setEditError(msg);
        } finally {
            setEditLoading(false);
        }
    };

    const handleMarkPaid = async (id) => {
        try {
            await markAsPaid(id);
            showMessage('success', 'Payroll marked as paid. Payslip sent to employee.');
            fetchPayroll();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message : 'Failed to mark as paid';
            showMessage('error', msg);
        }
    };

    return (
        <div className="space-y-4">

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => { setView('my'); setPage(1); }}
                        className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'my' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Payroll
                    </button>
                    {isAdminOrHR && (
                        <button
                            onClick={() => { setView('all'); setPage(1); }}
                            className={`px-4 py-2 text-sm rounded-lg font-medium transition ${view === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Payroll
                        </button>
                    )}
                </div>
                {isAdminOrHR && (
                    <button
                        onClick={() => { setGenerateError(''); setShowGenerateModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Generate Payroll
                    </button>
                )}
            </div>

            {/* Payroll table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                        No payroll records found
                    </div>
                ) : view === 'all' ? (
                    // Card layout for All Payroll
                    <div className="divide-y divide-gray-100">
                        {payrolls.map(payroll => (
                            <div key={payroll.id} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {payroll.employee && payroll.employee.first_name && payroll.employee.first_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">
                                                {payroll.employee && `${payroll.employee.first_name} ${payroll.employee.last_name}`}
                                            </p>
                                            <p className="text-xs text-gray-400">{payroll.employee && payroll.employee.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-xs font-medium text-gray-500">{MONTHS[payroll.month - 1]} {payroll.year}</p>
                                        <StatusBadge status={payroll.status} />
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    <div>
                                        <p className="text-xs text-gray-400">Basic</p>
                                        <p className="text-xs font-medium text-gray-900">{formatCurrency(payroll.basic_salary)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Bonus</p>
                                        <p className="text-xs font-medium text-green-600">{formatCurrency(payroll.bonus)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Tax ({payroll.tax_rate || 0}%)</p>
                                        <p className="text-xs font-medium text-orange-600">{formatCurrency(payroll.tax_amount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Deductions</p>
                                        <p className="text-xs font-medium text-red-600">{formatCurrency(payroll.deductions)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Net Salary</p>
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(payroll.net_salary)}</p>
                                    </div>
                                </div>
                                {isAdminOrHR && (
                                    <div className="mt-3 flex items-center justify-between">
                                        <p className="text-xs text-gray-400">
                                            {payroll.status === 'paid'
                                                ? `Paid on ${new Date(payroll.paid_at).toLocaleDateString()}`
                                                : 'Not yet paid'}
                                        </p>
                                        <div className="flex gap-2">
                                            {payroll.status !== 'paid' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayroll(payroll);
                                                        setEditForm({
                                                            bonus: payroll.bonus || 0,
                                                            deductions: payroll.deductions || 0,
                                                            basic_salary: payroll.basic_salary || 0,
                                                            tax_rate: payroll.tax_rate || 0,
                                                            tax_method: payroll.tax_method || 'basic',
                                                        });
                                                        setEditError('');
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {payroll.status !== 'paid' && (
                                                <button
                                                    onClick={() => handleMarkPaid(payroll.id)}
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Table layout for My Payroll
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Basic</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Bonus</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Tax</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Deductions</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Net</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payrolls.map(payroll => (
                                    <tr key={payroll.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-gray-700 text-xs font-medium whitespace-nowrap">
                                            {MONTHS[payroll.month - 1]} {payroll.year}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs hidden sm:table-cell whitespace-nowrap">
                                            {formatCurrency(payroll.basic_salary)}
                                        </td>
                                        <td className="px-4 py-3 text-green-600 text-xs hidden sm:table-cell whitespace-nowrap">
                                            {formatCurrency(payroll.bonus)}
                                        </td>
                                        <td className="px-4 py-3 text-orange-600 text-xs hidden md:table-cell whitespace-nowrap">
                                            {formatCurrency(payroll.tax_amount)} ({payroll.tax_rate || 0}%)
                                        </td>
                                        <td className="px-4 py-3 text-red-600 text-xs hidden md:table-cell whitespace-nowrap">
                                            {formatCurrency(payroll.deductions)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-gray-900 text-sm whitespace-nowrap">
                                            {formatCurrency(payroll.net_salary)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={payroll.status} />
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

            {/* Generate Payroll Modal */}
            {showGenerateModal && (
                <Modal title="Generate Payroll" onClose={() => setShowGenerateModal(false)}>
                    {generateError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {generateError}
                        </div>
                    )}
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={generateForm.month}
                                onChange={(e) => setGenerateForm({ ...generateForm, month: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {MONTHS.map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                            <input
                                type="number"
                                required
                                min="2000"
                                max="2100"
                                value={generateForm.year}
                                onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                This will generate payroll for all active employees for {MONTHS[generateForm.month - 1]} {generateForm.year}. Employees without a basic salary set will have GHS 0.00.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={generateLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {generateLoading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Payroll Modal */}
            {showEditModal && selectedPayroll && (
                <Modal title={`Edit Payroll — ${MONTHS[selectedPayroll.month - 1]} ${selectedPayroll.year}`} onClose={() => setShowEditModal(false)}>
                    {editError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {editError}
                        </div>
                    )}
                    <form onSubmit={handleEdit} className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Basic Salary (GHS)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={editForm.basic_salary}
                                onChange={(e) => setEditForm({ ...editForm, basic_salary: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bonus (GHS)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={editForm.bonus}
                                onChange={(e) => setEditForm({ ...editForm, bonus: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Deductions (GHS)</label>
                            <input
                                type="number" min="0" step="0.01"
                                value={editForm.deductions}
                                onChange={(e) => setEditForm({ ...editForm, deductions: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Tax section */}
                        <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Tax Settings</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                                    <input
                                        type="number" min="0" max="100" step="0.01"
                                        value={editForm.tax_rate}
                                        onChange={(e) => setEditForm({ ...editForm, tax_rate: e.target.value })}
                                        placeholder="e.g. 15"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax Method</label>
                                    <select
                                        value={editForm.tax_method}
                                        onChange={(e) => setEditForm({ ...editForm, tax_method: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="basic">On Basic only</option>
                                        <option value="gross">On Gross (Basic + Bonus)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    {editForm.tax_method === 'gross'
                                        ? `Tax = (Basic + Bonus) × ${editForm.tax_rate || 0}% = ${formatCurrency(
                                            ((parseFloat(editForm.basic_salary || 0) + parseFloat(editForm.bonus || 0)) * (parseFloat(editForm.tax_rate || 0) / 100))
                                        )}`
                                        : `Tax = Basic × ${editForm.tax_rate || 0}% = ${formatCurrency(
                                            (parseFloat(editForm.basic_salary || 0) * (parseFloat(editForm.tax_rate || 0) / 100))
                                        )}`
                                    }
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    Net = Basic + Bonus - Tax - Deductions = {formatCurrency(
                                        parseFloat(editForm.basic_salary || 0) +
                                        parseFloat(editForm.bonus || 0) -
                                        (editForm.tax_method === 'gross'
                                            ? (parseFloat(editForm.basic_salary || 0) + parseFloat(editForm.bonus || 0)) * (parseFloat(editForm.tax_rate || 0) / 100)
                                            : parseFloat(editForm.basic_salary || 0) * (parseFloat(editForm.tax_rate || 0) / 100)
                                        ) -
                                        parseFloat(editForm.deductions || 0)
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {editLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default PayrollPage;