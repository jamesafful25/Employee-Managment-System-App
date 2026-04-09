const { Attendance, Employee, Department } = require('../model');
const { AppError } = require('../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { Op } = require('sequelize');


//determing the number of hours an employee worked
const calculateHoursWorked = (clockIn, clockOut) => {
    const diff = new Date(clockOut) - new Date(clockIn);
    return parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
};

//clock in status( late or not late)
const determineStatus = (clockInTime) => {
    const date = new Date(clockInTime);
    const hour = date.getHours();
    const minutes = date.getMinutes();
    if (hour > 8 || (hour === 8 && minutes > 15)) return 'late';
    return 'present';
};

//clock in time
const clockIn = async(employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({
        where: { employee_id: employeeId, date: today },
    });
    if (existing) throw new AppError('Already clocked in today', 400);
    const clockInTime = new Date();
    const status = determineStatus(clockInTime);
    const attendance = await Attendance.create({
        employee_id: employeeId,
        clock_in: clockInTime,
        date: today,
        status,
    });
    return attendance.toJSON();
};

//clock out time
const clockOut = async(employeeId) => {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({
        where: { employee_id: employeeId, date: today },
    });
    if (!attendance) throw new AppError('You have not clocked in today', 400);
    if (attendance.clock_out) throw new AppError('Already clocked out today', 400);
    const clockOutTime = new Date();
    attendance.clock_out = clockOutTime;
    attendance.hours_worked = calculateHoursWorked(attendance.clock_in, clockOutTime);
    await attendance.save();
    return attendance.toJSON();
};

//Get your own  attendance
const getMyAttendance = async(employeeId, query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Attendance.findAndCountAll({
        distinct: true,
        where: { employee_id: employeeId },
        limit,
        offset,
        order: [
            ['date', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//Get employee attedance
const getEmployeeAttendance = async(employeeId, query) => {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) throw new AppError('Employee not found', 404);
    const { limit, offset, page } = parsePaginationParams(query);
    const { count, rows } = await Attendance.findAndCountAll({
        distinct: true,
        where: { employee_id: employeeId },
        limit,
        offset,
        order: [
            ['date', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//attendance
const getAllAttendance = async(query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { startDate, endDate } = query;

    const whereClause = {};
    if (startDate && endDate) {
        whereClause.date = {
            [Op.between]: [startDate, endDate]
        };
    }

    const { count, rows } = await Attendance.findAndCountAll({
        distinct: true,
        where: whereClause,
        include: [{
            model: Employee,
            as: 'employee',
            attributes: ['id', 'first_name', 'last_name'],
            include: [{
                model: Department,
                as: 'department',
                attributes: ['id', 'name'],
            }],
        }],
        limit,
        offset,
        order: [
            ['date', 'DESC']
        ],
    });
    return { data: rows, meta: buildPaginationMeta(count, page, limit) };
};

//determing whether the employee is present or absent from work
const markAbsent = async() => {
    const today = new Date().toISOString().split('T')[0];
    const employees = await Employee.findAll({ where: { is_active: true } });
    await Promise.all(employees.map(async(employee) => {
        const existing = await Attendance.findOne({
            where: { employee_id: employee.id, date: today },
        });
        if (!existing) {
            await Attendance.create({
                employee_id: employee.id,
                date: today,
                clock_in: null,
                status: 'absent',
            });
        }
    }));
    return { message: 'Absence marked successfully' };
};

//attendance report
const getAttendanceReport = async(query) => {
    const { startDate, endDate, departmentId } = query;
    if (!startDate || !endDate) throw new AppError('startDate and endDate are required', 400);

    const employees = await Employee.findAll({
        where: departmentId ? { department_id: departmentId } : {},
        include: [{
            model: Attendance,
            as: 'attendances',
            attributes: ['date', 'clock_in', 'clock_out', 'status', 'hours_worked'],
            where: {
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            required: false,
        }],
    });

    return employees.map((employee) => {
        const attendances = employee.attendances || [];
        return {
            employee: {
                id: employee.id,
                first_name: employee.first_name,
                last_name: employee.last_name,
            },
            summary: {
                totalPresent: attendances.filter(a => a.status === 'present').length,
                totalLate: attendances.filter(a => a.status === 'late').length,
                totalAbsent: attendances.filter(a => a.status === 'absent').length,
                totalHours: attendances.reduce((sum, a) => sum + (parseFloat(a.hours_worked) || 0), 0),
            },
            records: attendances,
        };
    });
};

module.exports = {
    clockIn,
    clockOut,
    getMyAttendance,
    getEmployeeAttendance,
    getAllAttendance,
    markAbsent,
    getAttendanceReport,
};