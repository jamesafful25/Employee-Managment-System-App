const { Leave, LeaveType, Employee } = require('../model');
const { AppError } = require('../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../utils/pagination');
const { sendLeaveApprovedEmail, sendLeaveRejectedEmail } = require('./emailService');
const { Op } = require('sequelize');

//calculation of total leave days
const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

//calculation of leave balance
const calculateLeaveBalance = async(employeeId, leaveTypeId) => {
    const leaveType = await LeaveType.findByPk(leaveTypeId);
    if (!leaveType) throw new AppError('Leave type not found', 404);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const usedDays = await Leave.sum('total_days', {
        where: {
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
            status: 'approved',
            createdAt: {
                [Op.gte]: startOfYear
            },
        },
    });

    return {
        leave_type_id: leaveTypeId,
        leaveType: { name: leaveType.name },
        total_days: leaveType.max_days,
        used_days: usedDays || 0,
        remaining_days: leaveType.max_days - (usedDays || 0),
    };
};

//applying for a leave
const applyLeave = async(employeeId, data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(data.start_date);
    startDate.setHours(0, 0, 0, 0);
    if (startDate < today) {
        throw new AppError('Cannot apply leave with past dates', 400);
    }
    const totalDays = calculateTotalDays(data.start_date, data.end_date);

    const balance = await calculateLeaveBalance(employeeId, data.leave_type_id);
    if (totalDays > balance.remaining_days) {
        throw new AppError(`Insufficient leave balance. Remaining: ${balance.remaining_days} days`, 400);
    }

    const overlapping = await Leave.findOne({
        where: {
            employee_id: employeeId,
            status: {
                [Op.ne]: 'rejected'
            },
            [Op.or]: [{
                    start_date: {
                        [Op.between]: [data.start_date, data.end_date]
                    }
                },
                {
                    end_date: {
                        [Op.between]: [data.start_date, data.end_date]
                    }
                },
                {
                    [Op.and]: [{
                            start_date: {
                                [Op.lte]: data.start_date
                            }
                        },
                        {
                            end_date: {
                                [Op.gte]: data.end_date
                            }
                        }
                    ]
                }
            ]
        },
    });
    if (overlapping) throw new AppError('You already have a leave request for these dates', 400);

    const leave = await Leave.create({
        employee_id: employeeId,
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        total_days: totalDays,
        reason: data.reason,
    });

    return leave;
};

//leave approval by hr or manager
const approveLeave = async(leaveId, approverId) => {
    const leave = await Leave.findByPk(leaveId, {
        include: [{ model: Employee, as: 'employee' }],
    });
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.status !== 'pending') throw new AppError('Leave is already processed', 400);

    leave.status = 'approved';
    leave.approved_by = approverId;
    await leave.save();

    try {
        await sendLeaveApprovedEmail(leave.employee, leave);
    } catch (err) {
        console.error('Email failed:', err.message);
    }

    return leave;
};

//leave rejection by the manager/hr (leave approval)
const rejectLeave = async(leaveId, approverId) => {
    const leave = await Leave.findByPk(leaveId, {
        include: [{ model: Employee, as: 'employee' }],
    });
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.status !== 'pending') throw new AppError('Leave is already processed', 400);

    leave.status = 'rejected';
    leave.approved_by = approverId;
    await leave.save();

    try {
        await sendLeaveRejectedEmail(leave.employee, leave);
    } catch (err) {
        console.error('Email failed:', err.message);
    }

    return leave;
};

//leave cancellation(hr or manager)
const cancelLeave = async(leaveId, employeeId) => {
    const leave = await Leave.findByPk(leaveId);
    if (!leave) throw new AppError('Leave request not found', 404);
    if (leave.employee_id !== employeeId) throw new AppError('Unauthorized', 403);
    if (leave.status !== 'pending') throw new AppError('Only pending leaves can be cancelled', 400);

    await leave.destroy();
    return { message: 'Leave cancelled successfully' };
};

//getting of leave report by an employee 
const getMyLeaves = async(employeeId, query) => {
    const { limit, offset, page } = parsePaginationParams(query);

    const { count, rows } = await Leave.findAndCountAll({
        distinct: true,
        where: { employee_id: employeeId },
        include: [{ model: LeaveType, as: 'leaveType', attributes: ['name'] }],
        limit,
        offset,
        order: [
            ['createdAt', 'DESC']
        ],
    });

    return {
        data: rows,
        meta: buildPaginationMeta(count, page, limit),
    };
};

//geting of all leave record
const getAllLeaves = async(query) => {
    const { limit, offset, page } = parsePaginationParams(query);
    const { status } = query;

    const whereClause = status ? { status } : {};

    const { count, rows } = await Leave.findAndCountAll({
        distinct: true,
        where: whereClause,
        include: [
            { model: Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name'] },
            { model: LeaveType, as: 'leaveType', attributes: ['name'] },
            { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] },
        ],
        limit,
        offset,
        order: [
            ['createdAt', 'DESC']
        ],
    });

    return {
        data: rows,
        meta: buildPaginationMeta(count, page, limit),
    };
};

//geting of leave balance
const getLeaveBalance = async(employeeId) => {
    const leaveTypes = await LeaveType.findAll();
    const balances = await Promise.all(
        leaveTypes.map((lt) => calculateLeaveBalance(employeeId, lt.id))
    );
    return balances;
};

//getting of leave reports
const getLeaveReport = async(query) => {
    const { startDate, endDate, departmentId, status } = query;

    const leaves = await Leave.findAll({
        where: {
            start_date: {
                [Op.lte]: endDate
            },
            end_date: {
                [Op.gte]: startDate
            },
            ...(status && { status }),

        },
        include: [{
                model: Employee,
                as: 'employee',
                where: departmentId ? { department_id: departmentId } : {},
                attributes: ['id', 'first_name', 'last_name', 'department_id'],
            },
            { model: LeaveType, as: 'leaveType', attributes: ['name'] },
            { model: Employee, as: 'approver', attributes: ['id', 'first_name', 'last_name'] },
        ],
    });

    const summary = {
        totalLeaves: leaves.length,
        totalDays: leaves.reduce((sum, l) => sum + l.total_days, 0),
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        pending: leaves.filter(l => l.status === 'pending').length,
    };

    return { summary, records: leaves };
};

module.exports = {
    applyLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    getMyLeaves,
    getAllLeaves,
    getLeaveBalance,
    getLeaveReport,
};