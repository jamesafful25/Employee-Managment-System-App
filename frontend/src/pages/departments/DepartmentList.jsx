import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignManager,
    assignEmployee,
} from '../../api/departmentAPI';
import { getAllEmployees } from '../../api/employeeAPI';

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

const DepartmentList = () => {
    const { isAdmin, isAdminOrHR } = useAuth();

    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);

    // forms
    const [addName, setAddName] = useState('');
    const [editName, setEditName] = useState('');
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const [deptRes, empRes] = await Promise.all([
                getAllDepartments(),
                getAllEmployees({ limit: 100 }),
            ]);
            setDepartments(deptRes.data.data || []);
            setEmployees(empRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await createDepartment({ name: addName });
            setShowAddModal(false);
            setAddName('');
            showMessage('success', 'Department created successfully');
            fetchDepartments();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to create department';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await updateDepartment(selectedDept.id, { name: editName });
            setShowEditModal(false);
            showMessage('success', 'Department updated successfully');
            fetchDepartments();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to update department';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        setFormLoading(true);
        try {
            await deleteDepartment(selectedDept.id);
            setShowDeleteModal(false);
            showMessage('success', 'Department deleted successfully');
            fetchDepartments();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to delete department';
            showMessage('error', msg);
            setShowDeleteModal(false);
        } finally {
            setFormLoading(false);
        }
    };

    const handleAssignManager = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await assignManager(selectedDept.id, selectedManagerId);
            setShowManagerModal(false);
            showMessage('success', 'Manager assigned successfully');
            fetchDepartments();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to assign manager';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    const handleAssignEmployee = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError('');
        try {
            await assignEmployee(selectedDept.id, selectedEmployeeId);
            setShowAssignModal(false);
            showMessage('success', 'Employee assigned successfully');
            fetchDepartments();
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to assign employee';
            setFormError(msg);
        } finally {
            setFormLoading(false);
        }
    };

    // employees that belong to a specific department
    const deptEmployees = selectedDept
        ? employees.filter(e => e.department_id === selectedDept.id)
        : [];

    return (
        <div className="space-y-4">

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {departments.length} department{departments.length !== 1 ? 's' : ''} total
                </p>
                {isAdminOrHR && (
                    <button
                        onClick={() => { setAddName(''); setFormError(''); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Department
                    </button>
                )}
            </div>

            {/* Department cards */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : departments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-sm text-gray-400">
                    No departments yet. Create your first department!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map(dept => (
                        <div key={dept.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">

                            {/* Dept header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{dept.name}</h3>
                                        <p className="text-xs text-gray-500">
                                            {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Manager */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Manager</p>
                                {dept.manager ? (
                                    <p className="text-sm text-gray-900">
                                        {dept.manager.first_name} {dept.manager.last_name}
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No manager assigned</p>
                                )}
                            </div>

                            {/* Employees list */}
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">Members</p>
                                {dept.employees && dept.employees.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {dept.employees.slice(0, 3).map(emp => (
                                            <span key={emp.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                {emp.first_name} {emp.last_name}
                                            </span>
                                        ))}
                                        {dept.employees.length > 3 && (
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                                +{dept.employees.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No members yet</p>
                                )}
                            </div>

                            {/* Actions */}
                            {isAdminOrHR && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => { setSelectedDept(dept); setEditName(dept.name); setFormError(''); setShowEditModal(true); }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => { setSelectedDept(dept); setSelectedManagerId(''); setFormError(''); setShowManagerModal(true); }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                                    >
                                        Assign Manager
                                    </button>
                                    <button
                                        onClick={() => { setSelectedDept(dept); setSelectedEmployeeId(''); setFormError(''); setShowAssignModal(true); }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition"
                                    >
                                        Add Member
                                    </button>
                                    {isAdmin && (
                                        <button
                                            onClick={() => { setSelectedDept(dept); setShowDeleteModal(true); }}
                                            className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add Department Modal */}
            {showAddModal && (
                <Modal title="Add Department" onClose={() => setShowAddModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Department Name
                            </label>
                            <input
                                type="text"
                                required
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder="e.g. Engineering, HR, Finance"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {formLoading ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Edit Department Modal */}
            {showEditModal && selectedDept && (
                <Modal title="Edit Department" onClose={() => setShowEditModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Department Name
                            </label>
                            <input
                                type="text"
                                required
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {formLoading ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Assign Manager Modal */}
            {showManagerModal && selectedDept && (
                <Modal title={`Assign Manager — ${selectedDept.name}`} onClose={() => setShowManagerModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleAssignManager} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Employee from this department
                            </label>
                            <select
                                required
                                value={selectedManagerId}
                                onChange={(e) => setSelectedManagerId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose employee...</option>
                                {deptEmployees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name} — {emp.position || emp.role}
                                    </option>
                                ))}
                            </select>
                            {deptEmployees.length === 0 && (
                                <p className="text-xs text-orange-600 mt-1">
                                    No employees in this department yet. Add members first.
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowManagerModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading || deptEmployees.length === 0}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {formLoading ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Assign Employee Modal */}
            {showAssignModal && selectedDept && (
                <Modal title={`Add Member — ${selectedDept.name}`} onClose={() => setShowAssignModal(false)}>
                    {formError && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {formError}
                        </div>
                    )}
                    <form onSubmit={handleAssignEmployee} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select Employee
                            </label>
                            <select
                                required
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Choose employee...</option>
                                {employees
                                    .filter(emp => emp.department_id !== selectedDept.id)
                                    .map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.first_name} {emp.last_name} — {emp.position || emp.role}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                            >
                                {formLoading ? 'Assigning...' : 'Add Member'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedDept && (
                <Modal title="Delete Department" onClose={() => setShowDeleteModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedDept.name}</span>? This cannot be undone.
                        </p>
                        <p className="text-xs text-orange-600">
                            Note: You cannot delete a department that still has employees assigned to it.
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
                                disabled={formLoading}
                                className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition"
                            >
                                {formLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default DepartmentList;