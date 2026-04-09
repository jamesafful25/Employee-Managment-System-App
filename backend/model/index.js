const sequelize = require('../config/db');
const Employee = require('./Employee');
const Department = require('./Department');
const Attendance = require('./Attendance');
const LeaveType = require('./LeaveType');
const Leave = require('./Leave');
const Payroll = require('./Payroll');
const Performance = require('./Performance');
const TokenBlacklist = require('./TokenBlacklist');
const File = require('./File');

//Department - employee relationship 
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' });
Employee.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// department manager — one employee manages one department
Department.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' });
// Manager → Department
Employee.hasOne(Department, { foreignKey: 'manager_id', as: 'managedDepartment' });

// Employee - Attendance  relationship
Employee.hasMany(Attendance, { foreignKey: 'employee_id', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

//Employee - Leave relationship 
Employee.hasMany(Leave, { foreignKey: 'employee_id', as: 'leaves' });
Leave.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// leave approver
Employee.hasMany(Leave, { foreignKey: 'approved_by', as: 'approvedLeaves' });
Leave.belongsTo(Employee, { foreignKey: 'approved_by', as: 'approver' });

//Leave type - Leave relationship 
LeaveType.hasMany(Leave, {
    foreignKey: 'leave_type_id',
    as: 'leaves',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});
Leave.belongsTo(LeaveType, {
    foreignKey: 'leave_type_id',
    as: 'leaveType',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});

// Employee - payroll relationship 
Employee.hasMany(Payroll, { foreignKey: 'employee_id', as: 'payrolls' });
Payroll.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

//Employee ↔ performance relation 
Employee.hasMany(Performance, { foreignKey: 'employee_id', as: 'performances' });
Performance.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' });

// reviewer
Employee.hasMany(Performance, { foreignKey: 'reviewed_by', as: 'reviewsGiven' });
Performance.belongsTo(Employee, { foreignKey: 'reviewed_by', as: 'reviewer' });

//file upload
Employee.hasMany(File, { foreignKey: 'uploaded_by', as: 'files' });
File.belongsTo(Employee, { foreignKey: 'uploaded_by', as: 'uploader' });

module.exports = {
    sequelize,
    Employee,
    Department,
    Attendance,
    LeaveType,
    Leave,
    Payroll,
    Performance,
    TokenBlacklist,
    File,
};