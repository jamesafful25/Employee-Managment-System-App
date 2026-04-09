import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEmployeeById, updateEmployee } from '../../api/employeeAPI';
import { getAllDepartments } from '../../api/departmentAPI';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin, isAdminOrHR } = useAuth();

    const [employee, setEmployee] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [editForm, setEditForm] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        position: '',
        hire_date: '',
        department_id: '',
        basic_salary: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, deptRes] = await Promise.all([
                    getEmployeeById(id),
                    getAllDepartments(),
                ]);
                const emp = empRes.data.data;
                setEmployee(emp);
                setDepartments(deptRes.data.data || []);
                setEditForm({
                    first_name: emp.first_name || '',
                    last_name: emp.last_name || '',
                    phone: emp.phone || '',
                    position: emp.position || '',
                    hire_date: emp.hire_date ? emp.hire_date.split('T')[0] : '',
                    department_id: emp.department_id || '',
                    basic_salary: emp.basic_salary || '',
                });
            } catch (err) {
                console.error('Failed to fetch employee:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await updateEmployee(id, editForm);
            setEmployee(res.data.data);
            setEditing(false);
            showMessage('success', 'Employee updated successfully');
        } catch (err) {
            const msg = err.response && err.response.data && err.response.data.message
                ? err.response.data.message
                : 'Failed to update employee';
            showMessage('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditForm({
            first_name: employee.first_name || '',
            last_name: employee.last_name || '',
            phone: employee.phone || '',
            position: employee.position || '',
            hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
            department_id: employee.department_id || '',
        });
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="text-center py-12 text-sm text-gray-400">
                Employee not found
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-4">

            {/* Back button */}
            <button
                onClick={() => navigate('/employees')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Employees
            </button>

            {/* Message */}
            {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                            {employee.first_name && employee.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {employee.first_name} {employee.last_name}
                            </h2>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${employee.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        employee.role === 'hr' ? 'bg-blue-100 text-blue-700' :
                                            employee.role === 'manager' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {employee.role}
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${employee.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {employee.is_active == 1 ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {isAdminOrHR && !editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* First Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">First Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editForm.first_name}
                                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">{employee.first_name || '—'}</p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Last Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editForm.last_name}
                                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">{employee.last_name || '—'}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">{employee.phone || '—'}</p>
                        )}
                    </div>

                    {/* Position */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                        {editing ? (
                            <input
                                type="text"
                                value={editForm.position}
                                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">{employee.position || '—'}</p>
                        )}
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                        {editing ? (
                            <select
                                value={editForm.department_id}
                                onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">No Department</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-gray-900">
                                {employee.department ? employee.department.name : '—'}
                            </p>
                        )}
                    </div>

                    {/* Hire Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hire Date</label>
                        {editing ? (
                            <input
                                type="date"
                                value={editForm.hire_date}
                                onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">
                                {employee.hire_date
                                    ? new Date(employee.hire_date).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })
                                    : '—'}
                            </p>
                        )}
                    </div>

                    {/* Basic Salary */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Basic Salary (GHS)</label>
                        {editing ? (
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editForm.basic_salary}
                                onChange={(e) => setEditForm({ ...editForm, basic_salary: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-sm text-gray-900">
                                {employee.basic_salary
                                    ? new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(employee.basic_salary)
                                    : '—'}
                            </p>
                        )}
                    </div>

                    {/* Email — never editable */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <p className="text-sm text-gray-900">{employee.email}</p>
                    </div>

                    {/* Member since */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Member Since</label>
                        <p className="text-sm text-gray-900">
                            {new Date(employee.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>

                </div>

                {/* Edit action buttons */}
                {editing && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default EmployeeDetail;