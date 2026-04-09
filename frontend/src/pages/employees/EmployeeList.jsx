import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllEmployees, deleteEmployee, deactivateEmployee, activateEmployee, changeRole } from '../../api/employeeAPI';
import { registerEmployee, adminResetPassword } from '../../api/authAPI';

const ROLES = ['admin', 'hr', 'manager', 'employee'];

const Badge = ({ value }) => {
    const colors = {
        admin: 'bg-purple-100 text-purple-700',
        hr: 'bg-blue-100 text-blue-700',
        manager: 'bg-yellow-100 text-yellow-700',
        employee: 'bg-gray-100 text-gray-700',
        true: 'bg-green-100 text-green-700',
        false: 'bg-red-100 text-red-700',
    };
    const labels = {
        true: 'Active',
        false: 'Inactive',
    };
    const key = String(value);
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${colors[key] || 'bg-gray-100 text-gray-700'}`}>
            {labels[key] || value}
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

const EmployeeList = () => {
    const { isAdmin, isAdminOrHR, employee: currentUser } = useAuth();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });

    // modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // add employee form
    const [addForm, setAddForm] = useState({
        first_name: '', last_name: '', email: '',
        phone: '', position: '', role: 'employee',
        department_id: '', hire_date: '',
    });
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState('');

    // role form
    const [newRole, setNewRole] = useState('');
    const [roleLoading, setRoleLoading] = useState(false);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllEmployees({ search, page, limit: 10 });
            setEmployees(res.data.data || []);
            setMeta(res.data.meta || {});
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError('');
        try {
            await registerEmployee(addForm);
            setShowAddModal(false);
            setAddForm({
                first_name: '', last_name: '', email: '',
                phone: '', position: '', role: 'employee',
                department_id: '', hire_date: '',
            });
            showMessage('success', 'Employee registered successfully. Login credentials sent to their email.');
            fetchEmployees();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to register employee';
            setAddError(msg);
        } finally {
            setAddLoading(false);
        }
    };

    const handleToggleActive = async (emp) => {
        try {
            if (emp.is_active) {
                await deactivateEmployee(emp.id);
                showMessage('success', `${emp.first_name} deactivated successfully`);
            } else {
                await activateEmployee(emp.id);
                showMessage('success', `${emp.first_name} activated successfully`);
            }
            fetchEmployees();
        } catch (err) {
            showMessage('error', 'Action failed. Please try again.');
        }
    };

    const handleChangeRole = async () => {
        if (!newRole) return;
        setRoleLoading(true);
        try {
            await changeRole(selectedEmployee.id, newRole);
            showMessage('success', `Role updated to ${newRole} successfully`);
            setShowRoleModal(false);
            fetchEmployees();
        } catch (err) {
            showMessage('error', 'Failed to change role');
        } finally {
            setRoleLoading(false);
        }
    };

    const handleResetPassword = async (emp) => {
        try {
            await adminResetPassword(emp.id);
            showMessage('success', `Password reset email sent to ${emp.email}`);
        } catch (err) {
            showMessage('error', 'Failed to reset password');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteEmployee(selectedEmployee.id);
            showMessage('success', 'Employee deleted successfully');
            setShowDeleteModal(false);
            fetchEmployees();
        } catch (err) {
            showMessage('error', 'Failed to delete employee');
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
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
                    >
                        Search
                    </button>
                </form>
                {isAdminOrHR && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Employee
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">No employees found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {employees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                    {emp.first_name && emp.first_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {emp.first_name} {emp.last_name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{emp.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{emp.position || '—'}</td>
                                        <td className="px-6 py-4"><Badge value={emp.role} /></td>
                                        <td className="px-6 py-4"><Badge value={emp.is_active} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* View */}
                                                <button
                                                    onClick={() => navigate(`/employees/${emp.id}`)}
                                                    className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                                >
                                                    View
                                                </button>
                                                {/* Deactivate / Activate — admin only */}
                                                {isAdmin && emp.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleToggleActive(emp)}
                                                        className={`text-xs px-2.5 py-1 rounded-lg transition ${emp.is_active ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' : 'bg-green-100 hover:bg-green-200 text-green-700'}`}
                                                    >
                                                        {emp.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                                {/* Change Role — admin only */}
                                                {isAdmin && emp.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => { setSelectedEmployee(emp); setNewRole(emp.role); setShowRoleModal(true); }}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                                                    >
                                                        Role
                                                    </button>
                                                )}
                                                {/* Reset Password — admin only */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleResetPassword(emp)}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition"
                                                    >
                                                        Reset pwd
                                                    </button>
                                                )}
                                                {/* Delete — admin only */}
                                                {isAdmin && emp.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => { setSelectedEmployee(emp); setShowDeleteModal(true); }}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                                    >
                                                        Delete
                                                    </button>
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
                            Showing page {meta.currentPage} of {meta.totalPages}
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

            {/* Add Employee Modal */}
            {showAddModal && (
                <Modal title="Add New Employee" onClose={() => { setShowAddModal(false); setAddError(''); }}>
                    {addError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {addError}
                        </div>
                    )}
                    <form onSubmit={handleAddEmployee} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.first_name}
                                    onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.last_name}
                                    onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={addForm.email}
                                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="text"
                                required
                                value={addForm.phone}
                                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                            <input
                                type="text"
                                required
                                value={addForm.position}
                                onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={addForm.role}
                                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hire Date</label>
                                <input
                                    type="date"
                                    value={addForm.hire_date}
                                    onChange={(e) => setAddForm({ ...addForm, hire_date: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { setShowAddModal(false); setAddError(''); }}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {addLoading ? 'Adding...' : 'Add Employee'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Change Role Modal */}
            {showRoleModal && selectedEmployee && (
                <Modal title={`Change Role — ${selectedEmployee.first_name}`} onClose={() => setShowRoleModal(false)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Select New Role</label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangeRole}
                                disabled={roleLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {roleLoading ? 'Saving...' : 'Save Role'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedEmployee && (
                <Modal title="Delete Employee" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default EmployeeList;